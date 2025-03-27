
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import PuzzleGame from '@/components/PuzzleGame';
import { useAuth } from '@/hooks/useAuth';

const PuzzlePage = () => {
  const [response, setResponse] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePuzzleComplete = (aiResponse: string) => {
    setResponse(aiResponse);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4">Puzzle Adventures</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create questions by arranging puzzle pieces and get fun answers from our AI!
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <PuzzleGame 
          initialPrompt="Drag and drop the pieces to create a question for the AI"
          onComplete={handlePuzzleComplete}
        />
        
        <Card className="p-6 bg-muted/30">
          <h2 className="text-xl font-bold mb-4">How to Play</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Drag the puzzle pieces onto the board to form a question</li>
            <li>Arrange them in the order that makes sense</li>
            <li>Click "Ask Question" to get an answer from the AI</li>
            <li>Or type your own question if you prefer!</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default PuzzlePage;
