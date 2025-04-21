import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Send, X, Lightbulb, Puzzle, MessageSquare, Sparkles, Wand2, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateText, validateSentence as validateSentenceApi } from '@/integrations/aws/lambda';

interface PuzzlePiece {
  id: string;
  text: string;
  order: number;
  position: { x: number; y: number };
  color: string;
  rotation: number;
  scale: number;
  isNew?: boolean;
}

interface PuzzleGameProps {
  initialPrompt?: string;
  onComplete?: (response: string) => void;
}

// Array of vibrant colors for the blocks with gradient backgrounds
const blockColors = [
  'bg-gradient-to-br from-emerald-400 to-emerald-600',   // Green
  'bg-gradient-to-br from-sky-400 to-sky-600',           // Blue
  'bg-gradient-to-br from-amber-400 to-amber-600',       // Yellow/Orange
  'bg-gradient-to-br from-purple-400 to-purple-600',     // Purple
  'bg-gradient-to-br from-rose-400 to-rose-600',         // Pink
  'bg-gradient-to-br from-indigo-400 to-indigo-600',     // Indigo
];

const PuzzleGame = ({ initialPrompt = "Arrange the pieces to form a question", onComplete }: PuzzleGameProps) => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [knowledgeWords, setKnowledgeWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiValidation, setAiValidation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showWordShimmer, setShowWordShimmer] = useState(false);
  const [lastAddedWord, setLastAddedWord] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [magnetMode, setMagnetMode] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize puzzle pieces
  useEffect(() => {
    const generatePieces = () => {
      // Start with sample words in the knowledge box instead of pre-made pieces
      setKnowledgeWords([
        "What", "happens", "when", "animals", "learn", "to", "talk",
        "How", "do", "rainbows", "form", "in", "the", "sky",
        "Why", "stars", "twinkle", "at", "night"
      ]);
      
      return [];
    };
    
    setPieces(generatePieces());
    
    // Show the shimmer animation for word collection
    setTimeout(() => {
      setShowWordShimmer(true);
      setTimeout(() => setShowWordShimmer(false), 3000);
    }, 1000);
  }, []);

  // Automatically align pieces horizontally if magnetMode is on
  useEffect(() => {
    if (magnetMode && pieces.length > 1 && !draggedPiece) {
      const sortedPieces = [...pieces].sort((a, b) => a.position.x - b.position.x);
      
      const updatedPieces = sortedPieces.map((piece, index) => {
        if (containerRef.current) {
          const startX = 20;
          const spacing = 10;
          const previousPiecesWidth = sortedPieces
            .slice(0, index)
            .reduce((total, p) => total + (p.text.length * 10) + 40, 0);
          
          return {
            ...piece,
            position: {
              x: startX + previousPiecesWidth + (index * spacing),
              y: containerRef.current.clientHeight / 2 - 20
            }
          };
        }
        return piece;
      });
      
      setPieces(updatedPieces);
    }
  }, [magnetMode, pieces.length, draggedPiece]);

  const handleDragStart = (id: string, e: React.DragEvent) => {
    setDraggedPiece(id);
    
    // Set drag image offset to appear centered under cursor
    if (e.dataTransfer && e.target instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.target, e.target.clientWidth / 2, e.target.clientHeight / 2);
    }
    
    // Update the piece to increase size slightly during drag
    setPieces(pieces.map(piece => 
      piece.id === id 
        ? { ...piece, scale: 1.1, rotation: piece.rotation || 0 } 
        : piece
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Create a pulsing effect around the drop zone
    if (containerRef.current) {
      containerRef.current.style.boxShadow = "0 0 15px rgba(72, 187, 120, 0.6)";
      setIsDraggingOver(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // Remove the pulsing effect
    if (containerRef.current) {
      containerRef.current.style.boxShadow = "none";
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPiece || !containerRef.current) return;
    
    // Reset drag state
    setIsDraggingOver(false);
    
    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    // Keep coordinates within container bounds
    x = Math.min(Math.max(x, 0), containerRef.current.clientWidth - 100);
    y = Math.min(Math.max(y, 0), containerRef.current.clientHeight - 40);
    
    // Play a sound effect
    playDropSound();
    
    // Reset container style
    containerRef.current.style.boxShadow = "none";
    
    setPieces(pieces.map(piece => 
      piece.id === draggedPiece 
        ? { 
            ...piece, 
            position: { x, y },
            scale: 1.0,
            rotation: piece.rotation + (Math.random() * 5 - 2.5) // Add slight random rotation
          } 
        : piece
    ));
    
    setDraggedPiece(null);
  };

  const handleWordDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word);
    
    // Customize drag visual
    if (e.target instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.target, e.target.clientWidth / 2, e.target.clientHeight / 2);
    }
  };

  const handleWordDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    // Reset drag state
    setIsDraggingOver(false);
    
    const word = e.dataTransfer.getData('text/plain');
    if (!word) return; // Make sure we have a word to add
    
    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    // Keep coordinates within container bounds
    x = Math.min(Math.max(x, 0), containerRef.current.clientWidth - 100);
    y = Math.min(Math.max(y, 0), containerRef.current.clientHeight - 40);
    
    // Reset container style
    containerRef.current.style.boxShadow = "none";
    
    // Assign a random color from our colors array
    const randomColor = blockColors[Math.floor(Math.random() * blockColors.length)];
    const randomRotation = Math.random() * 6 - 3; // Random rotation between -3 and 3 degrees
    
    // Play a sound effect
    playDropSound();
    
    // Create tiny confetti burst at the drop point
    createWordConfetti(e.clientX, e.clientY);
    
    const newPiece: PuzzlePiece = {
      id: `piece-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: word,
      order: pieces.length,
      position: { x, y },
      color: randomColor,
      rotation: randomRotation,
      scale: 1.0,
      isNew: true
    };
    
    setPieces([...pieces, newPiece]);
    setAiValidation(null); // Clear previous validation when changing the sentence
    
    // Remove the "isNew" flag after animation completes
    setTimeout(() => {
      setPieces(currentPieces => 
        currentPieces.map(piece => 
          piece.id === newPiece.id ? { ...piece, isNew: false } : piece
        )
      );
    }, 500);
  };

  const handleAddWord = () => {
    if (newWord.trim()) {
      // Set this as the last added word for animation
      setLastAddedWord(newWord.trim());
      
      // Add word to collection
      setKnowledgeWords([...knowledgeWords, newWord.trim()]);
      setNewWord('');
      
      // Clear the last added word after animation
      setTimeout(() => setLastAddedWord(null), 1000);
      
      toast.success("Word added to collection!", {
        icon: <Sparkles className="h-4 w-4 text-amber-500" />
      });
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setKnowledgeWords(knowledgeWords.filter(word => word !== wordToRemove));
  };

  const handleRemovePiece = (idToRemove: string) => {
    // Add a removing animation
    setPieces(pieces.map(piece => 
      piece.id === idToRemove 
        ? { ...piece, scale: 0.1, rotation: piece.rotation + 180 } 
        : piece
    ));
    
    // Actually remove after animation
    setTimeout(() => {
      setPieces(pieces.filter(piece => piece.id !== idToRemove));
      setAiValidation(null); // Clear previous validation when changing the sentence
    }, 300);
  };

  const getCurrentQuestion = () => {
    // Sort pieces by x position to create a sentence
    const sortedPieces = [...pieces].sort((a, b) => a.position.x - b.position.x);
    return sortedPieces.map(piece => piece.text).join(' ');
  };

  const validateSentence = async () => {
    const sentence = getCurrentQuestion();
    if (sentence.trim() === '') {
      toast.error("Please create a question first!");
      return;
    }
    
    setIsValidating(true);
    setAiValidation(null);
    
    try {
      // Use the new Lambda integration module
      const validationText = await validateSentenceApi(sentence);
      setAiValidation(validationText);
      
      if (validationText.toLowerCase().includes('valid') || validationText.toLowerCase() === 'valid') {
        toast.success("Your question looks good! You can now submit it.");
      } else {
        toast.info("Try to improve your question.");
      }
      
    } catch (error) {
      console.error("Error validating question:", error);
      toast.error("Failed to validate question. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmitPuzzle = async () => {
    const question = customQuestion || getCurrentQuestion();
    if (question.trim() === '') {
      toast.error("Please create a question first!");
      return;
    }
    
    setIsSubmitting(true);
    setAiResponse('');
    
    try {
      // Use the new Lambda integration module
      const aiText = await generateText(question);
      setAiResponse(aiText);
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete(aiText);
      }
      
      // Create a success celebration
      createSuccessConfetti();
      
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Failed to generate response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confetti and sound effects
  const createWordConfetti = (x: number, y: number) => {
    confetti({
      particleCount: 15,
      spread: 50,
      origin: { 
        x: x / window.innerWidth, 
        y: y / window.innerHeight 
      },
      colors: ['#60A5FA', '#10B981', '#8B5CF6', '#F59E0B'],
      gravity: 0.5,
      scalar: 0.7,
      shapes: ['circle']
    });
  };

  const createSuccessConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#60A5FA', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'],
    });
  };

  const playDropSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAZABkA');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play error:', e));
  };

  // Text-to-speech functionality
  const speakText = (text: string) => {
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    if (!text) return;
    
    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Analyze text for emotional content to set appropriate voice parameters
    const detectEmotion = (text: string): { 
      rate: number; 
      pitch: number; 
      volume: number 
    } => {
      // Default values optimized for children's content
      let rate = 0.9;  // slightly slower than default
      let pitch = 1.2; // slightly higher pitch for child-friendly tone
      let volume = 1.0;
      
      // Check for question marks (curious tone)
      if (text.includes('?')) {
        pitch = 1.3; // Higher pitch for questions
        rate = 0.85; // Slightly slower for emphasis
      }
      
      // Check for exclamation marks (excited tone)
      if (text.includes('!')) {
        pitch = 1.4; // Higher pitch for excitement
        rate = 1.0;  // Normal rate for excitement
        volume = 1.0; // Full volume
      }
      
      // Check for emotional keywords to adjust voice
      const happyWords = ['happy', 'exciting', 'wonderful', 'fun', 'amazing', 'great', 'joy'];
      const sadWords = ['sad', 'unfortunately', 'sorry', 'difficult', 'problem'];
      const amazedWords = ['wow', 'incredible', 'fascinating', 'awesome', 'surprising'];
      
      // Convert to lowercase for better matching
      const lowerText = text.toLowerCase();
      
      // Detect emotion based on keywords
      if (happyWords.some(word => lowerText.includes(word))) {
        pitch = 1.3;  // Higher pitch for happiness
        rate = 1.0;   // Normal rate 
      } else if (amazedWords.some(word => lowerText.includes(word))) {
        pitch = 1.4;  // Even higher for amazement
        rate = 0.9;   // Slightly slower for emphasis
      } else if (sadWords.some(word => lowerText.includes(word))) {
        pitch = 1.0;  // Lower pitch for sadness
        rate = 0.8;   // Slower for sadness
      }
      
      return { rate, pitch, volume };
    };
    
    // Apply emotional parameters
    const emotion = detectEmotion(text);
    utterance.rate = emotion.rate;
    utterance.pitch = emotion.pitch;
    utterance.volume = emotion.volume;
    
    // Add natural pauses at punctuation
    const addPauses = (text: string): string => {
      return text
        .replace(/\./g, '.<break time="500ms"/>') // Add pause after periods
        .replace(/\!/g, '!<break time="600ms"/>') // Add longer pause after exclamations
        .replace(/\?/g, '?<break time="500ms"/>') // Add pause after questions
        .replace(/,/g, ',<break time="250ms"/>'); // Add small pause after commas
    };
    
    // Add SSML markup if browser supports it
    try {
      const ssmlText = `<speak>${addPauses(text)}</speak>`;
      // Some browsers might support SSML markup
      utterance.text = ssmlText;
    } catch (e) {
      // Fallback to regular text if SSML isn't supported
      utterance.text = text;
    }
    
    // Try to find a child-friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    
    // Preferred voices in order (natural-sounding first)
    const preferVoiceNames = [
      'Google UK English Female', // Good natural voice on Chrome
      'Samantha',                 // Good natural voice on macOS/iOS
      'Karen',                    // Australian female voice on macOS
      'Microsoft Zira',           // Good Windows voice
      'Female'                    // Generic female voices
    ];
    
    // Try to find the most natural-sounding voice available
    let preferredVoice = null;
    for (const voiceName of preferVoiceNames) {
      const foundVoice = voices.find(voice => voice.name.includes(voiceName));
      if (foundVoice) {
        preferredVoice = foundVoice;
        break;
      }
    }
    
    // Fallback: Try to find any female or child voice
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Kid') || 
        voice.name.includes('Child')
      );
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Apply word-by-word speaking by breaking into sentences
    // This creates more natural rhythm
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    // Set this utterance as ongoing
    speechSynthesisRef.current = utterance;
    
    // Event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Couldn't play speech. Try again.");
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    
    // Display a toast to enhance the experience
    toast.info("Reading the answer aloud...", {
      duration: 2000,
      icon: <Volume2 className="h-4 w-4 text-purple-500" />
    });
  };
  
  const toggleSpeech = () => {
    if (isSpeaking) {
      // Stop speaking
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.info("Stopped reading", { duration: 1000 });
    } else {
      // Start speaking
      speakText(aiResponse);
    }
  };
  
  // Load voices when component mounts
  useEffect(() => {
    // Some browsers need this to load voices
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Clean up speech synthesis when unmounting
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="flex flex-col space-y-6">
      {/* Main puzzle interface */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: Word collection */}
        <div className="w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col">
          <Card className={`p-4 flex-grow bg-gradient-to-br from-kid-yellow/60 to-amber-100 border-2 border-amber-400 rounded-xl shadow-md transition-all h-full ${
            showWordShimmer ? 'animate-pulse' : ''
          }`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-amber-700 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Word Collection
              </h3>
            </div>

            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add a new word"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                className="border-2 border-amber-300 focus:border-amber-500 rounded-xl font-medium"
              />
              <Button 
                onClick={handleAddWord} 
                className="bg-amber-400 hover:bg-amber-500 text-white rounded-xl transition-all hover:scale-105 shadow-md"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl flex flex-wrap gap-2 border-2 border-amber-200 relative overflow-y-auto flex-grow">
              {knowledgeWords.map((word, index) => {
                const colorIndex = index % blockColors.length;
                const blockColor = blockColors[colorIndex];
                const isLastAdded = word === lastAddedWord;
                
                return (
                  <div
                    key={`word-${index}`}
                    draggable
                    onDragStart={(e) => handleWordDragStart(e, word)}
                    className={`${blockColor} px-4 py-2 rounded-lg cursor-move flex items-center gap-1 text-white shadow-md 
                      hover:brightness-110 hover:scale-105 transition-all relative font-medium
                      before:content-[''] before:absolute before:left-0 before:top-0 before:h-1/2 before:w-full 
                      before:bg-white/20 before:rounded-t-lg
                      ${isLastAdded ? 'animate-bounce-once' : ''}`}
                  >
                    {word}
                    <button 
                      onClick={() => handleRemoveWord(word)}
                      className="ml-1 flex items-center justify-center w-5 h-5 bg-white/20 rounded-full 
                        hover:bg-white/30"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {isLastAdded && (
                      <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-300 animate-ping" />
                    )}
                  </div>
                );
              })}
              {knowledgeWords.length === 0 && (
                <p className="text-amber-600 text-sm">Add words to your collection!</p>
              )}
            </div>
            <p className="text-xs text-amber-700 mt-1 italic flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Drag words from here to the puzzle area
            </p>
          </Card>
        </div>

        {/* Right column: Drag and drop area */}
        <div className="flex-grow flex flex-col">
          <Card className="p-4 bg-white rounded-xl border-2 border-emerald-100 shadow-md h-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-emerald-700 flex items-center gap-2">
                <Puzzle className="h-5 w-5 text-emerald-500" />
                Build Your Question
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 text-xs ${magnetMode ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setMagnetMode(!magnetMode)}
              >
                {magnetMode ? '✓ Magnet Mode' : 'Magnet Mode'}
              </Button>
            </div>

            <div 
              ref={containerRef}
              className={`relative w-full flex-grow bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-dashed transition-all ${
                isDraggingOver 
                  ? 'border-emerald-400 bg-emerald-50/80' 
                  : 'border-emerald-200'
              } h-[500px]`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                // Use the appropriate handler based on whether this is a word or a piece
                if (draggedPiece) {
                  handleDrop(e);
                } else {
                  handleWordDrop(e);
                }
              }}
            >
              {pieces.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-emerald-400/70 pointer-events-none">
                  <p className="text-center px-4">
                    Drag words here to build your question!
                  </p>
                </div>
              )}
              
              {pieces.map((piece) => (
                <div
                  key={piece.id}
                  draggable
                  onDragStart={(e) => handleDragStart(piece.id, e)}
                  className={`absolute px-4 py-2 rounded-lg shadow-md cursor-move select-none 
                    ${piece.color} text-white font-medium
                    ${piece.isNew ? 'animate-drop-in' : 'transition-all duration-200'}
                    active:cursor-grabbing hover:shadow-lg hover:brightness-110 hover:scale-105
                    before:content-[''] before:absolute before:left-0 before:top-0 before:h-1/2 before:w-full 
                    before:bg-white/20 before:rounded-t-lg`}
                  style={{
                    left: `${piece.position.x}px`,
                    top: `${piece.position.y}px`,
                    transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
                    zIndex: draggedPiece === piece.id ? 10 : 1,
                  }}
                >
                  <div className="flex items-center gap-1">
                    {piece.text}
                    <button
                      className="ml-1 flex items-center justify-center w-5 h-5 bg-white/20 rounded-full hover:bg-white/30"
                      onClick={() => handleRemovePiece(piece.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <Button 
                variant="outline" 
                className="border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                onClick={validateSentence}
                disabled={isValidating || pieces.length === 0}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Check Sentence
                  </>
                )}
              </Button>
              
              <Button 
                disabled={isSubmitting || pieces.length === 0}
                onClick={handleSubmitPuzzle}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Asking...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Ask Question
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Answer section */}
      {aiValidation && (
        <Card className="p-4 border-2 border-blue-100 bg-blue-50/50 rounded-xl mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              Sentence Check
            </h3>
          </div>
          <p className="text-blue-700 text-sm">{aiValidation}</p>
        </Card>
      )}
      
      {aiResponse && (
        <Card className="p-4 border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              Answer
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={toggleSpeech}
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4 text-red-500" />
              ) : (
                <Volume2 className="h-4 w-4 text-purple-500" />
              )}
            </Button>
          </div>
          <p className="text-purple-900">{aiResponse}</p>
        </Card>
      )}
    </div>
  );
};

export default PuzzleGame;
