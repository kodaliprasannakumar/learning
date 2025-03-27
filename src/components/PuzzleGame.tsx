
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Send, X } from 'lucide-react';

interface PuzzlePiece {
  id: string;
  text: string;
  order: number;
  position: { x: number; y: number };
}

interface PuzzleGameProps {
  initialPrompt?: string;
  onComplete?: (response: string) => void;
}

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
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, []);

  const handleDragStart = (id: string) => {
    setDraggedPiece(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPiece || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPieces(pieces.map(piece => 
      piece.id === draggedPiece 
        ? { ...piece, position: { x, y } } 
        : piece
    ));
    
    setDraggedPiece(null);
  };

  const handleWordDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word);
  };

  const handleWordDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    const word = e.dataTransfer.getData('text/plain');
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPiece: PuzzlePiece = {
      id: `piece-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: word,
      order: pieces.length,
      position: { x, y }
    };
    
    setPieces([...pieces, newPiece]);
    setAiValidation(null); // Clear previous validation when changing the sentence
  };

  const handleAddWord = () => {
    if (newWord.trim()) {
      setKnowledgeWords([...knowledgeWords, newWord.trim()]);
      setNewWord('');
      toast.success("Word added to knowledge box!");
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setKnowledgeWords(knowledgeWords.filter(word => word !== wordToRemove));
  };

  const handleRemovePiece = (idToRemove: string) => {
    setPieces(pieces.filter(piece => piece.id !== idToRemove));
    setAiValidation(null); // Clear previous validation when changing the sentence
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
      
      toast.success("Puzzle completed!");
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Puzzle Game</h2>
      <p className="text-center mb-6 text-muted-foreground">{initialPrompt}</p>
      
      {/* Knowledge Box */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Knowledge Box</h3>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Add a new word"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
          />
          <Button onClick={handleAddWord} variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="bg-muted p-3 rounded-lg min-h-20 flex flex-wrap gap-2">
          {knowledgeWords.map((word) => (
            <div
              key={word}
              draggable
              onDragStart={(e) => handleWordDragStart(e, word)}
              className="bg-muted-foreground/20 px-3 py-1 rounded-lg cursor-move flex items-center gap-1 hover:bg-muted-foreground/30 transition-colors"
            >
              {word}
              <button 
                onClick={() => handleRemoveWord(word)}
                className="text-muted-foreground hover:text-destructive ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {knowledgeWords.length === 0 && (
            <p className="text-muted-foreground text-sm">Add words to your knowledge box!</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Drag words from here to the editor below</p>
      </div>
      
      {/* Puzzle Editor */}
      <div 
        ref={containerRef}
        className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg h-64 mb-6 p-4 overflow-hidden"
        onDragOver={handleDragOver}
        onDrop={handleWordDrop}
      >
        {pieces.map((piece) => (
          <div
            key={piece.id}
            draggable
            onDragStart={() => handleDragStart(piece.id)}
            className="absolute bg-kid-blue text-white px-3 py-1 rounded-lg cursor-move shadow-md flex items-center gap-1"
            style={{
              left: `${piece.position.x}px`,
              top: `${piece.position.y}px`,
              touchAction: 'none',
              zIndex: draggedPiece === piece.id ? 10 : 1,
              transition: draggedPiece === piece.id ? 'none' : 'all 0.2s ease'
            }}
          >
            {piece.text}
            <button 
              onClick={() => handleRemovePiece(piece.id)}
              className="text-white/80 hover:text-white ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {pieces.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Drag words here to form a question
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground">Current arrangement:</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={validateSentence}
            disabled={isValidating || pieces.length === 0}
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
        <div className="bg-muted p-3 rounded-lg min-h-12">
          {getCurrentQuestion() || "Start dragging the words!"}
        </div>
        
        {aiValidation && (
          <div className={`mt-2 p-2 rounded-lg text-sm ${aiValidation.startsWith("VALID") ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" : "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"}`}>
            {aiValidation.replace(/^(VALID|INVALID)/, '').trim()}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <Label htmlFor="custom-question">Or type your own question:</Label>
        <Input
          id="custom-question"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="Enter a question for the AI..."
          className="mt-1"
        />
      </div>
      
      <Button 
        onClick={handleSubmitPuzzle} 
        disabled={isSubmitting || (pieces.length === 0 && !customQuestion)}
        className="w-full bg-kid-blue hover:bg-kid-blue/80 text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Getting Answer...</span>
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            <span>Ask Question</span>
          </>
        )}
      </Button>
      
      {aiResponse && (
        <div className="mt-6 bg-muted p-4 rounded-lg animate-fade-in">
          <h3 className="text-lg font-medium mb-2">Answer:</h3>
          <p className="text-muted-foreground">{aiResponse}</p>
        </div>
      )}
    </Card>
  );
};

export default PuzzleGame;
