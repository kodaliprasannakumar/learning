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

  // Simple AI prediction (mock implementation for kids)
  const makeSimplePrediction = (input: string): boolean => {
    if (!input.trim()) return false;
    
    // Simple keyword-based prediction for demo
    const happyWords = ['love', 'happy', 'fun', 'great', 'awesome', 'good', 'amazing', 'yes', 'play', 'friend'];
    const sadWords = ['sad', 'bad', 'hate', 'boring', 'no', 'mean', 'lost', 'hurt', 'angry'];
    
    const lowerInput = input.toLowerCase();
    const happyScore = happyWords.filter(word => lowerInput.includes(word)).length;
    const sadScore = sadWords.filter(word => lowerInput.includes(word)).length;
    
    // If tied or no matches, use examples
    if (happyScore === sadScore) {
      const similarExample = examples.find(ex => 
        ex.text.toLowerCase().includes(lowerInput) || 
        lowerInput.includes(ex.text.toLowerCase())
      );
      return similarExample?.isHappy ?? (Math.random() > 0.5);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <Brain className="h-10 w-10 text-purple-600" />
              AI Teacher
          </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Teach the AI robot by showing it examples, then test how well it learned! 🤖✨
            </p>
        </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-8 h-full cursor-pointer transition-all duration-300 hover:shadow-xl">
                  <div className="text-center space-y-4">
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center text-4xl shadow-lg`}>
                      {game.emoji}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-800">{game.title}</h3>
                    <p className="text-gray-600">{game.description}</p>
                    
                    <Button
                      onClick={() => startGame(game.id)}
                      className={`w-full text-white bg-gradient-to-r ${game.color} hover:shadow-lg transition-all duration-300`}
                      disabled={credits < CREDIT_COST}
                    >
                      Start Teaching! ({CREDIT_COST} credit)
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
                    </div>
                    
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">How to Play:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <span>Show the AI examples by typing sentences</span>
                        </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <span>Tell the AI if each example is happy or sad</span>
                        </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <span>Test the AI with new sentences!</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              {currentGame?.emoji} {currentGame?.title}
            </h1>
            <Button onClick={resetGame} variant="outline" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Games
                      </Button>
                  </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant={currentMode === 'teach' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              1. Teaching Mode
            </Badge>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <Badge variant={currentMode === 'test' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              2. Testing Mode
            </Badge>
          </div>
        </motion.div>

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
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
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
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
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
      </Card>
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
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
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
                        </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
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
                        </Card>
    </div>
  );
};

export default AITrainerPage; 