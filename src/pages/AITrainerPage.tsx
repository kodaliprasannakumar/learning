import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { 
  Brain, 
  Heart,
  Sparkles,
  Rocket,
  Trophy,
  Plus,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

// Simple game data for kids
interface TeachingExample {
  text: string;
  isHappy: boolean;
}

interface AIGame {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  examples: TeachingExample[];
}

const CREDIT_COST = 1;

const AITrainerPage = () => {
  const { user } = useAuth();
  const { credits, spendCredits, earnCredits } = useCreditSystem();
  
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'teach' | 'test'>('teach');
  const [examples, setExamples] = useState<TeachingExample[]>([]);
  const [testInput, setTestInput] = useState('');
  const [prediction, setPrediction] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Simple AI games for kids
  const aiGames: AIGame[] = [
    {
      id: 'happy-sad',
      title: 'Happy or Sad?',
      description: 'Teach the AI to recognize happy and sad messages!',
      emoji: '😊',
      color: 'from-yellow-400 to-orange-500',
      examples: [
        { text: 'I love playing games!', isHappy: true },
        { text: 'Ice cream is yummy!', isHappy: true },
        { text: 'I lost my toy', isHappy: false },
        { text: 'This is boring', isHappy: false },
      ]
    },
    {
      id: 'good-bad',
      title: 'Good or Bad?',
      description: 'Help the AI learn what makes things good or bad!',
      emoji: '👍',
      color: 'from-green-400 to-blue-500',
      examples: [
        { text: 'Helping friends', isHappy: true },
        { text: 'Sharing toys', isHappy: true },
        { text: 'Being mean', isHappy: false },
        { text: 'Breaking things', isHappy: false },
      ]
    },
    {
      id: 'fun-boring',
      title: 'Fun or Boring?',
      description: 'Teach the AI about fun and boring activities!',
      emoji: '🎉',
      color: 'from-purple-400 to-pink-500',
      examples: [
        { text: 'Playing with friends', isHappy: true },
        { text: 'Going to the park', isHappy: true },
        { text: 'Doing homework', isHappy: false },
        { text: 'Waiting in line', isHappy: false },
      ]
    }
  ];

  const currentGame = aiGames.find(game => game.id === selectedGame);

  // Start a new game
  const startGame = async (gameId: string) => {
    if (credits < CREDIT_COST) {
      toast.error(`You need ${CREDIT_COST} credit to play! You have ${credits} credits.`);
      return;
    }

    await spendCredits(CREDIT_COST, 'Started AI Trainer game');
    setSelectedGame(gameId);
    const game = aiGames.find(g => g.id === gameId);
    setExamples(game?.examples || []);
    setCurrentMode('teach');
    setScore(0);
    setQuestionsAsked(0);
    toast.success('Let\'s teach the AI! 🤖');
  };

  // Add a new teaching example
  const addExample = (text: string, isHappy: boolean) => {
    if (!text.trim()) return;
    
    setExamples(prev => [...prev, { text: text.trim(), isHappy }]);
    toast.success('Great example! The AI is learning! ✨');
  };

  // Improved AI prediction that learns from user examples
  const makeSimplePrediction = (input: string): boolean => {
    if (!input.trim()) return false;
    
    const lowerInput = input.toLowerCase();
    const inputWords = lowerInput.split(/\s+/);
    
    // First, check training examples (highest priority)
    let bestExampleMatch = { score: 0, isHappy: false };
    
    examples.forEach(example => {
      const exampleWords = example.text.toLowerCase().split(/\s+/);
      
      // Calculate word overlap score
      const commonWords = inputWords.filter(word => 
        exampleWords.some(exWord => 
          word.includes(exWord) || exWord.includes(word) || word === exWord
        )
      );
      
      // Calculate similarity score (0-1)
      const similarityScore = commonWords.length / Math.max(inputWords.length, exampleWords.length);
      
      // Boost score for exact phrase matches
      if (example.text.toLowerCase().includes(lowerInput) || lowerInput.includes(example.text.toLowerCase())) {
        const boostScore = similarityScore + 0.3;
        if (boostScore > bestExampleMatch.score) {
          bestExampleMatch = { score: boostScore, isHappy: example.isHappy };
        }
      } else if (similarityScore > bestExampleMatch.score) {
        bestExampleMatch = { score: similarityScore, isHappy: example.isHappy };
      }
    });
    
    // If we have a good match from training examples, use it
    if (bestExampleMatch.score > 0.2) {
      return bestExampleMatch.isHappy;
    }
    
    // Fallback to keyword matching (but weighted by training data)
    const happyWords = ['love', 'happy', 'fun', 'great', 'awesome', 'good', 'amazing', 'yes', 'play', 'friend', 'enjoy', 'excited', 'wonderful'];
    const sadWords = ['sad', 'bad', 'hate', 'boring', 'no', 'mean', 'lost', 'hurt', 'angry', 'terrible', 'awful', 'upset'];
    
    let happyScore = 0;
    let sadScore = 0;
    
    // Count keyword matches
    inputWords.forEach(word => {
      if (happyWords.some(hw => word.includes(hw) || hw.includes(word))) {
        happyScore += 1;
      }
      if (sadWords.some(sw => word.includes(sw) || sw.includes(word))) {
        sadScore += 1;
      }
    });
    
    // Weight based on training examples
    const happyExamples = examples.filter(ex => ex.isHappy).length;
    const sadExamples = examples.filter(ex => !ex.isHappy).length;
    const totalExamples = examples.length;
    
    if (totalExamples > 0) {
      // Adjust scores based on training data distribution
      happyScore *= (1 + happyExamples / totalExamples);
      sadScore *= (1 + sadExamples / totalExamples);
    }
    
    // If still tied, use a slight bias based on most recent training examples
    if (happyScore === sadScore && examples.length > 0) {
      const recentExamples = examples.slice(-3); // Last 3 examples
      const recentHappyCount = recentExamples.filter(ex => ex.isHappy).length;
      return recentHappyCount >= recentExamples.length / 2;
    }
    
    return happyScore > sadScore;
  };

  // Test the AI
  const testAI = () => {
    if (!testInput.trim()) {
      toast.error('Please type something to test!');
      return;
    }

    const predicted = makeSimplePrediction(testInput);
    setPrediction(predicted);
    setShowResult(true);
    setQuestionsAsked(prev => prev + 1);
  };

  // Handle user feedback on prediction
  const handleFeedback = (wasCorrect: boolean) => {
    if (wasCorrect) {
      setScore(prev => prev + 1);
      toast.success('The AI got it right! 🎉');
        } else {
      toast.info('The AI is still learning! Add more examples to help it.');
        }
    
    setTestInput('');
    setPrediction(null);
    setShowResult(false);

    // End game after 5 questions
    if (questionsAsked >= 5) {
      const finalScore = wasCorrect ? score + 1 : score;
      toast.success(`Game complete! Final score: ${finalScore}/5`);
      
      if (finalScore >= 3) {
        earnCredits(2, 'Good AI training performance');
              }
      
      setSelectedGame(null);
      setCurrentMode('teach');
    }
  };

  // Reset game
  const resetGame = () => {
    setSelectedGame(null);
    setCurrentMode('teach');
    setExamples([]);
    setTestInput('');
    setPrediction(null);
    setScore(0);
    setQuestionsAsked(0);
    setShowResult(false);
  };

  if (!selectedGame) {
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold py-4 leading-[1.4] bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              AI Teacher
          </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Teach the AI robot by showing it examples, then test how well it learned! 🤖✨
            </p>
                </div>
          
          <div className="grid grid-cols-1 gap-8 mb-8">
            <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-50 border-2 border-purple-200 rounded-xl shadow-md">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Brain className="h-8 w-8 text-purple-600" />
                <h2 className="text-xl font-bold text-purple-700">Choose Your AI Training Game</h2>
          </div>
          
              <div className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aiGames.map((game, index) => (
              <motion.div
                      key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                    >
                      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-90`} />
                        <div className="relative p-6 text-white text-center">
                          <div className="text-4xl mb-3">{game.emoji}</div>
                          <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                          <p className="text-sm opacity-90 mb-4">{game.description}</p>
                          <Button
                            onClick={() => startGame(game.id)}
                            disabled={credits < CREDIT_COST}
                            className="bg-white text-gray-800 hover:bg-gray-100 font-semibold px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Start Teaching! ({CREDIT_COST} credit)
                          </Button>
                  </div>
                      </Card>
                    </motion.div>
                  ))}
                    </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-blue-100 to-purple-50 border-2 border-blue-200 rounded-xl shadow-md">
              <div className="flex items-center mb-4 gap-2">
                <Rocket className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-bold text-blue-700">How to Play:</h2>
                        </div>
              <div className="bg-white/50 p-4 rounded-xl border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      1
                        </div>
                    <p className="text-blue-700 font-medium">Show the AI examples by typing sentences</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      2
                    </div>
                    <p className="text-blue-700 font-medium">Tell the AI if each example is happy or sad</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      3
                    </div>
                    <p className="text-blue-700 font-medium">Test the AI with new sentences!</p>
                  </div>
                    </div>
                  </div>
                </Card>
          </div>
        </div>
      </div>
    );
  }

                return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold py-4 leading-[1.4] bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            {currentGame?.emoji} {currentGame?.title}
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button onClick={resetGame} variant="outline" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Games
                      </Button>
                  </div>
            </div>
        
        <div className="grid grid-cols-1 gap-8 mb-8">
          <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-50 border-2 border-purple-200 rounded-xl shadow-md">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge variant={currentMode === 'teach' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                1. Teaching Mode
              </Badge>
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <Badge variant={currentMode === 'test' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                2. Testing Mode
              </Badge>
          </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
              {currentMode === 'teach' ? (
                <TeachingMode 
                  game={currentGame!}
                  examples={examples}
                  onAddExample={addExample}
                  onStartTesting={() => setCurrentMode('test')}
                />
              ) : (
                <TestingMode
                  game={currentGame!}
                  examples={examples}
                  testInput={testInput}
                  onTestInputChange={setTestInput}
                  prediction={prediction}
                  showResult={showResult}
                  score={score}
                  questionsAsked={questionsAsked}
                  onTest={testAI}
                  onFeedback={handleFeedback}
                  onBackToTeaching={() => setCurrentMode('teach')}
                />
              )}
                    </div>
          </Card>
                  </div>
      </div>
    </div>
  );
};

// Teaching Mode Component
const TeachingMode = ({ 
  game, 
  examples, 
  onAddExample, 
  onStartTesting 
}: {
  game: AIGame;
  examples: TeachingExample[];
  onAddExample: (text: string, isHappy: boolean) => void;
  onStartTesting: () => void;
}) => {
  const [newExample, setNewExample] = useState('');

  const handleAdd = (isHappy: boolean) => {
    onAddExample(newExample, isHappy);
    setNewExample('');
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          Teach the AI Robot!
        </h2>
        <p className="text-gray-600 mb-6">
          Type sentences and tell the AI if they are {game.id === 'happy-sad' ? 'happy or sad' : 
          game.id === 'good-bad' ? 'good or bad' : 'fun or boring'}. The more examples you give, the smarter it becomes!
        </p>

        <div className="space-y-4">
          <Input
            value={newExample}
            onChange={(e) => setNewExample(e.target.value)}
            placeholder="Type a sentence to teach the AI..."
            className="text-lg p-4"
          />
                  
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => handleAdd(true)}
              disabled={!newExample.trim()}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              This is {game.id === 'happy-sad' ? 'Happy' : game.id === 'good-bad' ? 'Good' : 'Fun'}!
            </Button>
                    <Button 
              onClick={() => handleAdd(false)}
              disabled={!newExample.trim()}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              This is {game.id === 'happy-sad' ? 'Sad' : game.id === 'good-bad' ? 'Bad' : 'Boring'}
                    </Button>
                </div>
              </div>
                    </div>
                    
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <h3 className="text-xl font-bold text-purple-800 mb-4">
          Examples the AI has learned ({examples.length}):
                  </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
          {examples.map((example, index) => (
            <div
                        key={index} 
              className={`p-3 rounded-lg border-2 ${
                example.isHappy 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {example.isHappy ? <Heart className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <span className="text-sm">{example.text}</span>
                          </div>
                        </div>
                    ))}
                </div>

        {examples.length >= 4 && (
                      <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
                      >
                        <Button
              onClick={onStartTesting}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-lg px-8 py-3"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Test the AI! ({examples.length} examples ready)
                        </Button>
                      </motion.div>
        )}
                    </div>
                  </div>
  );
};

// Testing Mode Component
const TestingMode = ({
  game,
  examples,
  testInput,
  onTestInputChange,
  prediction,
  showResult,
  score,
  questionsAsked,
  onTest,
  onFeedback,
  onBackToTeaching
}: {
  game: AIGame;
  examples: TeachingExample[];
  testInput: string;
  onTestInputChange: (value: string) => void;
  prediction: boolean | null;
  showResult: boolean;
  score: number;
  questionsAsked: number;
  onTest: () => void;
  onFeedback: (correct: boolean) => void;
  onBackToTeaching: () => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Test the AI Robot!
          </h2>
          <div className="text-right">
            <div className="text-sm text-gray-600">Score: {score}/{questionsAsked}</div>
            <div className="text-sm text-gray-600">Questions left: {5 - questionsAsked}</div>
                </div>
              </div>

        <p className="text-gray-600 mb-6">
          Type a new sentence and see if the AI can guess correctly! You have {5 - questionsAsked} questions left.
        </p>

                      <div className="space-y-4">
          <Input
            value={testInput}
            onChange={(e) => onTestInputChange(e.target.value)}
            placeholder="Type something new to test the AI..."
            className="text-lg p-4"
            disabled={showResult}
          />

          {!showResult ? (
            <div className="text-center">
                          <Button
                onClick={onTest}
                disabled={!testInput.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg px-8 py-3"
              >
                <Brain className="h-5 w-5 mr-2" />
                Ask the AI!
                          </Button>
                      </div>
          ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className={`p-6 rounded-lg border-2 ${
                prediction 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-2xl mb-2">
                  {prediction ? '😊' : '😔'}
                        </div>
                <p className="text-lg font-bold">
                  The AI thinks this is {prediction 
                    ? (game.id === 'happy-sad' ? 'Happy' : game.id === 'good-bad' ? 'Good' : 'Fun')
                    : (game.id === 'happy-sad' ? 'Sad' : game.id === 'good-bad' ? 'Bad' : 'Boring')
                  }!
                </p>
                  </div>

              <div className="space-y-2">
                <p className="text-gray-600">Was the AI correct?</p>
                <div className="flex gap-4 justify-center">
                        <Button 
                    onClick={() => onFeedback(true)}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                        >
                    <Check className="h-4 w-4" />
                    Yes, correct!
                        </Button>
                          <Button
                    onClick={() => onFeedback(false)}
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    No, wrong
                          </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                          </div>
                          </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-blue-800">
            The AI learned from {examples.length} examples you taught it!
          </p>
          <Button
            onClick={onBackToTeaching}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add More Examples
          </Button>
                          </div>
      </div>
    </div>
  );
};

export default AITrainerPage; 