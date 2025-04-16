import { useState } from 'react';
import { Card } from '@/components/ui/card';
import PuzzleGame from '@/components/PuzzleGame';
import { useAuth } from '@/hooks/useAuth';
import { Puzzle, Lightbulb, Sparkles, Coins } from 'lucide-react';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { toast } from '@/components/ui/use-toast';

// Credit rewards
const PUZZLE_COMPLETION_REWARD = 3;

const PuzzlePage = () => {
  const [response, setResponse] = useState<string | null>(null);
  const { user } = useAuth();
  const { earnCredits } = useCreditSystem();

  const handlePuzzleComplete = async (aiResponse: string) => {
    setResponse(aiResponse);
    
    // Reward credits for completion
    const success = await earnCredits(PUZZLE_COMPLETION_REWARD, "Completed a puzzle");
    if (success) {
      toast({
        title: "Great job!",
        description: `You earned ${PUZZLE_COMPLETION_REWARD} credits for completing the puzzle!`,
        variant: "default",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8 animate-fade-in">
        
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-transparent bg-clip-text">
          Word Puzzle Adventures
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create amazing questions by arranging colorful blocks and get fun answers from our AI friend!
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <PuzzleGame 
          initialPrompt="Build your question by dragging colorful word blocks!"
          onComplete={handlePuzzleComplete}
        />
        
        <Card className="p-6 bg-gradient-to-br from-kid-pink/40 to-purple-100 border-2 border-kid-pink/50 rounded-xl">
          <div className="flex items-center mb-4 gap-2">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-bold text-purple-700">How to Play</h2>
          </div>
          <ol className="list-decimal pl-6 space-y-3 text-purple-800">
            <li className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Add fun words to your collection box
            </li>
            <li className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Drag the colorful blocks onto the puzzle board
            </li>
            <li className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              Arrange them in the order that makes sense
            </li>
            <li className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              Click "Check Sentence" to see if your question is good
            </li>
            <li className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
              Click "Ask Question" to get an answer from the AI
            </li>
            <li className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
              Or type your own question if you prefer!
            </li>
          </ol>
          <div className="mt-4 flex justify-center">
            <Sparkles className="h-6 w-6 text-amber-500 animate-pulse-soft" />
          </div>
        </Card>
      </div>
      
      {/* Add credit information somewhere in your UI */}
      <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-lg">
        <h3 className="text-lg font-medium text-purple-700 flex items-center gap-2">
          <Coins className="h-5 w-5 text-purple-600" />
          Puzzle Rewards
        </h3>
        <p className="text-sm text-purple-600 mt-1">
          Complete puzzles correctly to earn {PUZZLE_COMPLETION_REWARD} credits each time!
        </p>
      </div>
    </div>
  );
};

export default PuzzlePage;
