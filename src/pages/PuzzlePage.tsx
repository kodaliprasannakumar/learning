import { useState } from 'react';
import { Card } from '@/components/ui/card';
import PuzzleGame from '@/components/PuzzleGame';
import { useAuth } from '@/hooks/useAuth';
import { Puzzle, Lightbulb, Sparkles, Coins } from 'lucide-react';

const PuzzlePage = () => {
  const [response, setResponse] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePuzzleComplete = async (aiResponse: string) => {
    setResponse(aiResponse);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-transparent bg-clip-text">
          Word Puzzle Adventures
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create amazing questions by arranging colorful blocks and get fun answers from our AI friend!
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="w-full">
          <PuzzleGame 
            initialPrompt="Build your question by dragging colorful word blocks!"
            onComplete={handlePuzzleComplete}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          <Card className="p-6 bg-gradient-to-br from-blue-100 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-md">
            <div className="flex items-center mb-4 gap-2">
              <Coins className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-bold text-blue-700">Rewards & Benefits</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-lg font-medium text-blue-700 mb-2">How Credits Work</h3>
                <p className="text-blue-600">
                  Each question you ask costs 1 credit. Build and ask questions to learn and explore!
                </p>
              </div>
              <div className="bg-white/50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-lg font-medium text-blue-700 mb-2">Learning Benefits</h3>
                <p className="text-blue-600">
                  Building questions helps improve vocabulary, sentence structure, and critical thinking skills!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PuzzlePage;
