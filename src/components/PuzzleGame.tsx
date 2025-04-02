import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Send, X, Lightbulb, Puzzle, MessageSquare, Sparkles, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';

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
    const question = getCurrentQuestion();
    if (!question.trim()) {
      toast.error("Please arrange some words to form a question");
      return;
    }
    
    setIsValidating(true);
    setAiValidation(null);
    
    try {
      // Get AI validation
      const { data, error } = await supabase.functions.invoke('generate-media', {
        body: {
          mode: 'text',
          prompt: `I'm a child using an app to form questions by arranging words. Here's my current arrangement: "${question}". 
          Is this a well-formed, meaningful question? If yes, just respond with "VALID". 
          If no, respond with "INVALID" followed by a very brief, child-friendly suggestion on how to improve it. Keep your response under 100 characters.`,
          max_tokens: 100
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        console.error("AI validation error:", data.error);
        throw new Error(data.error);
      }
      
      const validationResponse = data.response || "";
      setAiValidation(validationResponse);
      
      if (validationResponse.startsWith("VALID")) {
        toast.success("Your question looks good!");
        createSuccessConfetti();
      } else {
        toast.info("Your question needs improvement");
      }
    } catch (error) {
      console.error("Error validating sentence:", error);
      toast.error("Failed to validate. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmitPuzzle = async () => {
    const question = customQuestion || getCurrentQuestion();
    if (!question.trim()) {
      toast.error("Please arrange the pieces or enter a custom question");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get AI response
      const { data, error } = await supabase.functions.invoke('generate-media', {
        body: {
          mode: 'text',
          prompt: `Answer this child's question in a friendly, educational way: "${question}"`,
          max_tokens: 300
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        console.error("AI response error:", data.error);
        throw new Error(data.error);
      }
      
      setAiResponse(data.response || "I'm not sure about that. Can you try asking a different question?");
      
      if (onComplete) {
        onComplete(data.response);
      }
      
      // Celebrate with confetti!
      createSuccessConfetti();
      
      toast.success("Puzzle completed!");
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get a response. Please try again.");
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

  return (
    <Card className="p-6 border-4 border-kid-pink rounded-2xl shadow-lg bg-white/95">
      <h2 className="text-2xl font-bold mb-4 text-center text-kid-blue flex justify-center items-center gap-2">
    
      </h2>
      <p className="text-center mb-6 text-violet-600 font-medium">{initialPrompt}</p>
      
      {/* Knowledge Box */}
      <div className={`mb-6 bg-kid-yellow rounded-xl p-4 border-2 border-amber-400 shadow-md transition-all ${showWordShimmer ? 'animate-pulse' : ''}`}>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2 text-amber-700">
          <Lightbulb className="h-5 w-5" />
          Word Collection
        </h3>
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
        
        <div className="bg-amber-50 p-3 rounded-xl min-h-20 flex flex-wrap gap-2 border-2 border-amber-200 relative">
          {knowledgeWords.map((word, index) => {
            // Cycle through colors for variety
            const colorIndex = index % blockColors.length;
            const blockColor = blockColors[colorIndex];
            const isLastAdded = word === lastAddedWord;
            
            return (
              <div
                key={word}
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
          Drag words from here to the puzzle area below
        </p>
      </div>
      
      {/* Magnet Mode Toggle */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setMagnetMode(!magnetMode)}
          className={`text-xs flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
            magnetMode 
              ? 'bg-kid-blue text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Wand2 className="h-3 w-3" />
          {magnetMode ? 'Magic Alignment On' : 'Magic Alignment Off'}
        </button>
      </div>
      
      {/* Puzzle Editor */}
      <div 
        ref={containerRef}
        className={`relative ${isDraggingOver 
          ? 'border-4 border-kid-blue bg-gradient-to-br from-kid-green/40 to-kid-green/20' 
          : 'border-4 border-dashed border-kid-green bg-gradient-to-br from-kid-green/30 to-kid-green/10'} 
          rounded-xl h-80 sm:h-96 mb-6 p-4 overflow-hidden transition-all duration-300`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          // Use the appropriate handler based on whether this is a word from collection or moving an existing piece
          if (draggedPiece) {
            handleDrop(e);
          } else {
            handleWordDrop(e);
          }
        }}
      >
        {pieces.map((piece) => (
          <div
            key={piece.id}
            draggable
            onDragStart={(e) => handleDragStart(piece.id, e)}
            className={`absolute ${piece.color} px-4 py-2 text-white rounded-lg cursor-move shadow-md flex items-center gap-1
                        transition-all duration-300 font-medium
                        before:content-[''] before:absolute before:left-0 before:top-0 before:h-1/2 before:w-full 
                        before:bg-white/20 before:rounded-t-lg
                        ${piece.isNew ? 'animate-pop-in' : ''}`}
            style={{
              left: `${Math.min(Math.max(piece.position.x, 0), containerRef.current ? containerRef.current.clientWidth - 100 : 0)}px`,
              top: `${Math.min(Math.max(piece.position.y, 0), containerRef.current ? containerRef.current.clientHeight - 40 : 0)}px`,
              touchAction: 'none',
              zIndex: draggedPiece === piece.id ? 10 : 1,
              transform: `scale(${piece.scale || 1}) rotate(${piece.rotation || 0}deg)`,
              transition: draggedPiece === piece.id ? 'none' : 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {piece.text}
            <button 
              onClick={() => handleRemovePiece(piece.id)}
              className="ml-1 flex items-center justify-center w-5 h-5 bg-white/20 rounded-full 
                        hover:bg-white/30"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {pieces.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-teal-700/70 pointer-events-none">
            <div className="flex flex-col items-center">
              <Puzzle className="w-12 h-12 mb-2 animate-bounce-light" />
              <span>Drag words here to form a question</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6 bg-sky-50 rounded-xl p-4 border-2 border-sky-200">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-sky-700 font-medium flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Current arrangement:
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={validateSentence}
            disabled={isValidating || pieces.length === 0}
            className="bg-cyan-500 hover:bg-cyan-600 text-white border-0 rounded-full shadow-sm hover:scale-105 transition-all"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <span>Check Sentence</span>
            )}
          </Button>
        </div>
        <div className="bg-white p-3 rounded-lg min-h-12 border-2 border-sky-100 text-sky-800 font-medium">
          {getCurrentQuestion() || "Start dragging the words!"}
        </div>
        
        {aiValidation && (
          <div className={`mt-3 p-3 rounded-lg text-sm animate-slide-up ${aiValidation.startsWith("VALID") 
                ? "bg-green-100 text-green-800 border-2 border-green-200" 
                : "bg-amber-100 text-amber-800 border-2 border-amber-200"}`}>
            {aiValidation.replace(/^(VALID|INVALID)/, '').trim()}
            {aiValidation.startsWith("VALID") && (
              <Sparkles className="inline-block ml-1 h-3 w-3 text-green-500 animate-ping" />
            )}
          </div>
        )}
      </div>
      
      <div className="mb-6 bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
        <Label htmlFor="custom-question" className="text-purple-700 font-medium">Or type your own question:</Label>
        <Input
          id="custom-question"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="Enter a question for the AI..."
          className="mt-2 border-2 border-purple-200 focus:border-purple-400 rounded-xl"
        />
      </div>
      
      <Button 
        onClick={handleSubmitPuzzle} 
        disabled={isSubmitting || (pieces.length === 0 && !customQuestion)}
        className="w-full bg-gradient-to-r from-kid-blue to-sky-500 hover:brightness-110 text-white rounded-xl py-6 font-bold text-lg shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Getting Answer...</span>
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            <span>Ask Question</span>
          </>
        )}
      </Button>
      
      {aiResponse && (
        <div className="mt-6 bg-gradient-to-br from-purple-100 to-sky-100 p-5 rounded-xl border-2 border-purple-200 animate-fade-in shadow-md">
          <h3 className="text-lg font-medium mb-2 text-purple-700 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Answer:
          </h3>
          <p className="text-sky-800">{aiResponse}</p>
        </div>
      )}
    </Card>
  );
};

export default PuzzleGame;
