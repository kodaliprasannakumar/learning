
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';

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
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize puzzle pieces
  useEffect(() => {
    const generatePieces = () => {
      const samplePieces = [
        "What happens",
        "when",
        "animals",
        "learn",
        "to talk",
        "?",
        "How do",
        "rainbows",
        "form",
        "in the sky",
        "?",
        "Why do",
        "stars",
        "twinkle",
        "at night",
        "?"
      ];
      
      // Shuffle the pieces
      const shuffled = [...samplePieces].sort(() => Math.random() - 0.5);
      
      return shuffled.map((text, index) => ({
        id: `piece-${index}`,
        text,
        order: index,
        position: {
          x: Math.random() * 200,
          y: Math.random() * 100
        }
      }));
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

  const getCurrentQuestion = () => {
    // Sort pieces by x position to create a sentence
    const sortedPieces = [...pieces].sort((a, b) => a.position.x - b.position.x);
    return sortedPieces.map(piece => piece.text).join(' ');
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
      
      <div 
        ref={containerRef}
        className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg h-64 mb-6 p-4 overflow-hidden"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {pieces.map((piece) => (
          <div
            key={piece.id}
            draggable
            onDragStart={() => handleDragStart(piece.id)}
            className="absolute bg-kid-blue text-white px-3 py-1 rounded-lg cursor-move shadow-md"
            style={{
              left: `${piece.position.x}px`,
              top: `${piece.position.y}px`,
              touchAction: 'none',
              zIndex: draggedPiece === piece.id ? 10 : 1,
              transition: draggedPiece === piece.id ? 'none' : 'all 0.2s ease'
            }}
          >
            {piece.text}
          </div>
        ))}
      </div>
      
      <div className="mb-6">
        <p className="mb-2 text-sm text-muted-foreground">Current arrangement:</p>
        <div className="bg-muted p-3 rounded-lg min-h-12">
          {getCurrentQuestion() || "Start dragging the pieces!"}
        </div>
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
        disabled={isSubmitting}
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
