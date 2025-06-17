import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { 
  Calculator, 
  Star, 
  Trophy, 
  ArrowLeft,
  Target,
  ArrowRight,
  RefreshCw,
  Zap,
  Heart,
  Sparkles,
  Award,
  TrendingUp,
  Flame,
  Plus,
  Minus,
  X,
  Hash,
  Coins,
  Crown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

type GameType = 'easy-adding' | 'easy-subtracting' | 'times-tables' | 'mixed-math';

interface Question {
  question: string;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
}

interface GameLevel {
  level: number;
  name: string;
  description: string;
  requiredScore: number;
  maxNumber?: number;
  operationComplexity?: string;
}

const GAME_LEVELS: Record<GameType, GameLevel[]> = {
  'easy-adding': [
    { level: 1, name: 'Beginner', description: 'Simple sums (1-3)', requiredScore: 3, maxNumber: 5 },
    { level: 2, name: 'Explorer', description: 'Bigger numbers (1-7)', requiredScore: 4, maxNumber: 10 },
    { level: 3, name: 'Champion', description: 'Adding with carrying', requiredScore: 4, maxNumber: 15 },
    { level: 4, name: 'Master', description: 'Double-digit adding', requiredScore: 5, maxNumber: 20 },
    { level: 5, name: 'Genius', description: 'Complex carrying (25+)', requiredScore: 5, maxNumber: 25 }
  ],
  'easy-subtracting': [
    { level: 1, name: 'Beginner', description: 'Very simple (5-10)', requiredScore: 3, maxNumber: 10 },
    { level: 2, name: 'Explorer', description: 'Medium numbers (8-20)', requiredScore: 4, maxNumber: 20 },
    { level: 3, name: 'Champion', description: 'Borrowing introduced', requiredScore: 4, maxNumber: 50 },
    { level: 4, name: 'Master', description: 'Big borrowing (50-100)', requiredScore: 5, maxNumber: 100 },
    { level: 5, name: 'Genius', description: 'Multi-digit borrowing', requiredScore: 5, maxNumber: 200 }
  ],
  'times-tables': [
    { level: 1, name: 'Beginner', description: '1×, 2× tables only', requiredScore: 3, maxNumber: 2 },
    { level: 2, name: 'Explorer', description: 'Easy tables (1-5×)', requiredScore: 4, maxNumber: 5 },
    { level: 3, name: 'Champion', description: 'Medium tables (5-8×)', requiredScore: 4, maxNumber: 8 },
    { level: 4, name: 'Master', description: 'Hard tables (7-10×)', requiredScore: 5, maxNumber: 10 },
    { level: 5, name: 'Genius', description: 'Hardest tables (9-12×)', requiredScore: 5, maxNumber: 12 }
  ],
  'mixed-math': [
    { level: 1, name: 'Beginner', description: 'Easy +, - only', requiredScore: 3, operationComplexity: 'basic' },
    { level: 2, name: 'Explorer', description: '+, -, simple ×', requiredScore: 4, operationComplexity: 'intermediate' },
    { level: 3, name: 'Champion', description: 'All operations mixed', requiredScore: 4, operationComplexity: 'advanced' },
    { level: 4, name: 'Master', description: 'Complex double-digit', requiredScore: 5, operationComplexity: 'expert' },
    { level: 5, name: 'Genius', description: 'Ultimate math challenge', requiredScore: 5, operationComplexity: 'genius' }
  ]
};

const GAMES = [
  {
    id: 'easy-adding' as GameType,
    title: 'Easy Adding ➕',
    description: 'Add numbers together',
    icon: Plus,
    gradient: 'from-kid-blue to-blue-500',
    borderColor: 'border-kid-blue/40'
  },
  {
    id: 'easy-subtracting' as GameType,
    title: 'Easy Subtracting ➖',
    description: 'Subtract numbers',
    icon: Minus,
    gradient: 'from-kid-pink to-pink-500',
    borderColor: 'border-pink-400/40'
  },
  {
    id: 'times-tables' as GameType,
    title: 'Times Tables ✖️',
    description: 'Multiply numbers',
    icon: X,
    gradient: 'from-kid-purple to-purple-500',
    borderColor: 'border-purple-400/40'
  },
  {
    id: 'mixed-math' as GameType,
    title: 'Mixed Math 🔢',
    description: 'All operations mixed',
    icon: Hash,
    gradient: 'from-kid-orange to-orange-500',
    borderColor: 'border-orange-400/40'
  }
];

const MathPage = () => {
  const { user } = useAuth();
  const { credits, spendCredits, earnCredits } = useCreditSystem();
  const navigate = useNavigate();
  
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [gameLevels, setGameLevels] = useState<Record<GameType, number>>({
    'easy-adding': 1,
    'easy-subtracting': 1,
    'times-tables': 1,
    'mixed-math': 1
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);

  // Load levels from localStorage on component mount
  useEffect(() => {
    const savedLevels = localStorage.getItem('mathGameLevels');
    if (savedLevels) {
      setGameLevels(JSON.parse(savedLevels));
    }
  }, []);

  // Save levels to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mathGameLevels', JSON.stringify(gameLevels));
  }, [gameLevels]);

  const generateQuestions = (gameType: GameType, level: number): Question[] => {
    const questions: Question[] = [];
    const levelConfig = GAME_LEVELS[gameType][level - 1];
    
    for (let i = 0; i < 5; i++) {
      let question: Question;
      
      switch (gameType) {
        case 'easy-adding':
          const maxNum = levelConfig.maxNumber || 5;
          let num1, num2;
          
          // Progressive difficulty within each level
          if (level === 1) {
            // Level 1: Only small numbers (1-5), simple sums
            num1 = Math.floor(Math.random() * 3) + 1; // 1-3
            num2 = Math.floor(Math.random() * 3) + 1; // 1-3
          } else if (level === 2) {
            // Level 2: Slightly bigger numbers (1-10), some larger sums
            num1 = Math.floor(Math.random() * 7) + 1; // 1-7
            num2 = Math.floor(Math.random() * 7) + 1; // 1-7
          } else if (level === 3) {
            // Level 3: Bigger numbers (1-15), introduce carrying
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            // Favor numbers that require carrying
            if (Math.random() < 0.6) {
              num1 = Math.floor(Math.random() * 6) + 5; // 5-10
              num2 = Math.floor(Math.random() * 6) + 5; // 5-10
            }
          } else if (level === 4) {
            // Level 4: Larger numbers (1-20), more carrying
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            // Often use double-digit numbers
            if (Math.random() < 0.7) {
              num1 = Math.floor(Math.random() * 11) + 10; // 10-20
              num2 = Math.floor(Math.random() * 10) + 1;   // 1-10
            }
    } else {
            // Level 5: Biggest numbers (1-25), complex carrying
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            // Favor large double-digit additions
            if (Math.random() < 0.8) {
              num1 = Math.floor(Math.random() * 16) + 10; // 10-25
              num2 = Math.floor(Math.random() * 16) + 10; // 10-25
            }
          }
          
            question = {
            question: `${num1} + ${num2}`,
            answer: num1 + num2
          };
          break;
          
        case 'easy-subtracting':
          const maxRange = levelConfig.maxNumber || 10;
          let big, small;
          
          if (level === 1) {
            // Level 1: Very simple (5-10 minus small numbers)
            big = Math.floor(Math.random() * 6) + 5;    // 5-10
            small = Math.floor(Math.random() * 3) + 1;  // 1-3
            if (small >= big) small = big - 1;
          } else if (level === 2) {
            // Level 2: Medium numbers (8-20 minus medium numbers)
            big = Math.floor(Math.random() * 13) + 8;   // 8-20
            small = Math.floor(Math.random() * 8) + 1;  // 1-8
            if (small >= big) small = big - 1;
          } else if (level === 3) {
            // Level 3: Larger numbers (15-50, might need borrowing)
            big = Math.floor(Math.random() * 36) + 15;  // 15-50
            small = Math.floor(Math.random() * 20) + 1; // 1-20
            if (small >= big) small = big - 1;
            // Favor borrowing scenarios
            if (Math.random() < 0.6) {
              big = Math.floor(Math.random() * 20) + 20;  // 20-39
              small = Math.floor(Math.random() * 15) + 5; // 5-19
            }
          } else if (level === 4) {
            // Level 4: Big numbers (30-100, borrowing common)
            big = Math.floor(Math.random() * 71) + 30;   // 30-100
            small = Math.floor(Math.random() * 40) + 1;  // 1-40
            if (small >= big) small = big - 1;
            // Force borrowing scenarios
            if (Math.random() < 0.7) {
              big = Math.floor(Math.random() * 50) + 50;  // 50-99
              small = Math.floor(Math.random() * 30) + 15; // 15-44
            }
          } else {
            // Level 5: Huge numbers (50-200, complex borrowing)
            big = Math.floor(Math.random() * 151) + 50;  // 50-200
            small = Math.floor(Math.random() * 80) + 1;  // 1-80
            if (small >= big) small = big - 1;
            // Multi-digit borrowing
            if (Math.random() < 0.8) {
              big = Math.floor(Math.random() * 100) + 100; // 100-199
              small = Math.floor(Math.random() * 50) + 25;  // 25-74
            }
          }
          
            question = {
            question: `${big} - ${small}`,
            answer: big - small
          };
          break;
          
        case 'times-tables':
          const maxTable = levelConfig.maxNumber || 2;
          let mult1, mult2;
          
          if (level === 1) {
            // Level 1: Only 1x and 2x tables, easy numbers
            mult1 = Math.floor(Math.random() * 2) + 1;  // 1 or 2
            mult2 = Math.floor(Math.random() * 5) + 1;  // 1-5
          } else if (level === 2) {
            // Level 2: Up to 5x tables, focus on easier ones
            mult1 = Math.floor(Math.random() * 5) + 1;  // 1-5
            mult2 = Math.floor(Math.random() * 8) + 1;  // 1-8
            // Favor smaller multipliers
            if (Math.random() < 0.6) {
              mult1 = Math.floor(Math.random() * 3) + 1; // 1-3
            }
          } else if (level === 3) {
            // Level 3: Up to 8x tables, more variety
            mult1 = Math.floor(Math.random() * 8) + 1;  // 1-8
            mult2 = Math.floor(Math.random() * 10) + 1; // 1-10
            // Include more challenging tables
            if (Math.random() < 0.5) {
              mult1 = Math.floor(Math.random() * 4) + 5; // 5-8
            }
          } else if (level === 4) {
            // Level 4: Up to 10x tables, include trickier ones
            mult1 = Math.floor(Math.random() * 10) + 1; // 1-10
            mult2 = Math.floor(Math.random() * 12) + 1; // 1-12
            // Favor harder tables
            if (Math.random() < 0.6) {
              mult1 = Math.floor(Math.random() * 4) + 7; // 7-10
            }
          } else {
            // Level 5: Up to 12x tables, full challenge
            mult1 = Math.floor(Math.random() * 12) + 1; // 1-12
            mult2 = Math.floor(Math.random() * 12) + 1; // 1-12
            // Focus on the hardest tables
            if (Math.random() < 0.7) {
              mult1 = Math.floor(Math.random() * 4) + 9; // 9-12
            }
          }
          
          question = {
            question: `${mult1} × ${mult2}`,
            answer: mult1 * mult2
          };
          break;
          
        case 'mixed-math':
          const complexity = levelConfig.operationComplexity || 'basic';
          let operations = ['+', '-'];
          let a, b, ans;
          
          // Add multiplication based on level
          if (complexity === 'intermediate') {
            operations.push('×'); // Add easy multiplication
          } else if (complexity === 'advanced' || complexity === 'expert' || complexity === 'genius') {
            operations = ['+', '-', '×']; // All operations
            // In higher levels, favor multiplication more
            if (complexity === 'expert' || complexity === 'genius') {
              operations.push('×', '×'); // Make × more likely
            }
          }
          
          const operation = operations[Math.floor(Math.random() * operations.length)];
          
          if (operation === '+') {
            if (complexity === 'basic') {
              // Basic: Simple single-digit additions
              a = Math.floor(Math.random() * 8) + 1;  // 1-8
              b = Math.floor(Math.random() * 8) + 1;  // 1-8
            } else if (complexity === 'intermediate') {
              // Intermediate: Some double-digit
              a = Math.floor(Math.random() * 12) + 1; // 1-12
              b = Math.floor(Math.random() * 12) + 1; // 1-12
              if (Math.random() < 0.4) {
                a = Math.floor(Math.random() * 10) + 10; // 10-19
              }
            } else if (complexity === 'advanced') {
              // Advanced: Mix of single and double-digit
              a = Math.floor(Math.random() * 18) + 1;  // 1-18
              b = Math.floor(Math.random() * 18) + 1;  // 1-18
              if (Math.random() < 0.6) {
                a = Math.floor(Math.random() * 15) + 10; // 10-24
              }
            } else if (complexity === 'expert') {
              // Expert: Mostly double-digit
              a = Math.floor(Math.random() * 20) + 5;  // 5-24
              b = Math.floor(Math.random() * 20) + 5;  // 5-24
              if (Math.random() < 0.7) {
                a = Math.floor(Math.random() * 20) + 15; // 15-34
              }
            } else {
              // Genius: Large double-digit
              a = Math.floor(Math.random() * 25) + 10; // 10-34
              b = Math.floor(Math.random() * 25) + 10; // 10-34
            }
            ans = a + b;
            
          } else if (operation === '-') {
            if (complexity === 'basic') {
              // Basic: Simple subtractions
              a = Math.floor(Math.random() * 10) + 6;  // 6-15
              b = Math.floor(Math.random() * 5) + 1;   // 1-5
            } else if (complexity === 'intermediate') {
              // Intermediate: Medium subtractions
              a = Math.floor(Math.random() * 15) + 10; // 10-24
              b = Math.floor(Math.random() * 8) + 1;   // 1-8
            } else if (complexity === 'advanced') {
              // Advanced: Larger subtractions, some borrowing
              a = Math.floor(Math.random() * 25) + 15; // 15-39
              b = Math.floor(Math.random() * 15) + 1;  // 1-15
            } else if (complexity === 'expert') {
              // Expert: Big subtractions, borrowing common
              a = Math.floor(Math.random() * 40) + 25; // 25-64
              b = Math.floor(Math.random() * 20) + 5;  // 5-24
            } else {
              // Genius: Huge subtractions, complex borrowing
              a = Math.floor(Math.random() * 50) + 40; // 40-89
              b = Math.floor(Math.random() * 30) + 10; // 10-39
            }
            // Ensure no negative results
            if (b >= a) b = a - 1;
            ans = a - b;
            
          } else { // multiplication
            if (complexity === 'intermediate') {
              // Intermediate: Easy times tables
              a = Math.floor(Math.random() * 3) + 1;   // 1-3
              b = Math.floor(Math.random() * 8) + 1;   // 1-8
            } else if (complexity === 'advanced') {
              // Advanced: Medium times tables
              a = Math.floor(Math.random() * 6) + 1;   // 1-6
              b = Math.floor(Math.random() * 10) + 1;  // 1-10
            } else if (complexity === 'expert') {
              // Expert: Harder times tables
              a = Math.floor(Math.random() * 9) + 1;   // 1-9
              b = Math.floor(Math.random() * 12) + 1;  // 1-12
              // Favor harder multipliers
              if (Math.random() < 0.5) {
                a = Math.floor(Math.random() * 4) + 6; // 6-9
              }
            } else {
              // Genius: Hardest times tables
              a = Math.floor(Math.random() * 12) + 1;  // 1-12
              b = Math.floor(Math.random() * 12) + 1;  // 1-12
              // Focus on the hardest ones
              if (Math.random() < 0.6) {
                a = Math.floor(Math.random() * 4) + 9; // 9-12
              }
            }
            ans = a * b;
          }
          
          question = {
            question: `${a} ${operation} ${b}`,
            answer: ans
          };
          break;
          
        default:
          question = { question: '1 + 1', answer: 2 };
      }
      
      questions.push(question);
    }
    
    return questions;
  };

  const startGame = async (gameType: GameType) => {
    if (credits < 1) {
      toast.error("You need 1 credit to play a math game!");
      return;
    }

    const success = await spendCredits(1, `Play ${GAMES.find(g => g.id === gameType)?.title} Level ${gameLevels[gameType]}`);
    if (!success) {
      toast.error("Could not start game. Please try again.");
      return;
    }

    setSelectedGame(gameType);
    setCurrentLevel(gameLevels[gameType]);
    const newQuestions = generateQuestions(gameType, gameLevels[gameType]);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setUserInput('');
    setGameCompleted(false);
    setScore(0);
    setShowLevelUp(false);
    setLeveledUp(false);
    
    toast.success(`Level ${gameLevels[gameType]} started! Good luck! 🍀`);
  };

  const handleAnswer = () => {
    if (userInput === '') return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = parseInt(userInput);
    const isCorrect = userAnswer === currentQuestion.answer;
    
    // Update question with user's answer
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer,
      isCorrect
    };
    setQuestions(updatedQuestions);
    
    if (isCorrect) {
      setScore(score + 1);
      toast.success("✅ Correct! Great job!");
    } else {
      toast.error(`❌ Wrong! The answer was ${currentQuestion.answer}`);
    }
    
    // Move to next question or complete game
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserInput('');
      }, 1500);
        } else {
      setTimeout(() => {
        completeGame(score + (isCorrect ? 1 : 0));
      }, 1500);
    }
  };

  const completeGame = async (finalScore: number) => {
    setGameCompleted(true);
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const currentLevelConfig = GAME_LEVELS[selectedGame!][currentLevel - 1];
    const requiredScore = currentLevelConfig.requiredScore;
    const maxLevel = GAME_LEVELS[selectedGame!].length;
    
    // Check for level up
    if (finalScore >= requiredScore && currentLevel < maxLevel) {
      setLeveledUp(true);
      setShowLevelUp(true);
      
      // Update the level for this game type
      const newLevels = { ...gameLevels };
      newLevels[selectedGame!] = currentLevel + 1;
      setGameLevels(newLevels);
      
      // Extra confetti for level up
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
        });
      }, 500);
      
      await earnCredits(3, `Level up to ${currentLevel + 1}!`);
      toast.success(`🎉 LEVEL UP! You're now on Level ${currentLevel + 1}! Earned 3 bonus credits!`);
    } else if (finalScore >= requiredScore) {
      await earnCredits(2, `Perfect score on max level!`);
      toast.success(`🏆 Perfect! You've mastered the highest level! Earned 2 credits!`);
    } else if (finalScore >= 3) {
      await earnCredits(1, `Good performance: ${finalScore}/5!`);
      toast.success(`👍 Good job! You scored ${finalScore}/5 and earned 1 credit!`);
          } else {
      toast.info(`Keep practicing! You scored ${finalScore}/5. Get ${requiredScore}+ to level up!`);
    }
  };

  const resetGame = () => {
    setSelectedGame(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserInput('');
    setGameCompleted(false);
    setScore(0);
    setShowLevelUp(false);
    setLeveledUp(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnswer();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentLevelConfig = selectedGame ? GAME_LEVELS[selectedGame][currentLevel - 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-kid-blue/10 via-kid-pink/10 to-kid-purple/10 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
              {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4 text-kid-blue">Math Games</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Practice your math skills with progressive levels! 🧮✨
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Coins className="h-5 w-5 text-kid-orange" />
            <span className="text-lg font-semibold text-kid-orange">{credits} credits</span>
              </div>
        </motion.div>

        {!selectedGame ? (
          /* Game Selection */
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {GAMES.map((game, index) => {
              const currentGameLevel = gameLevels[game.id];
              const maxLevel = GAME_LEVELS[game.id].length;
              const levelConfig = GAME_LEVELS[game.id][currentGameLevel - 1];
              
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className={`p-6 shadow-lg border-4 ${game.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white/95`}
                        onClick={() => startGame(game.id)}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-lg`}>
                        <game.icon className="h-8 w-8 text-white" />
              </div>
                      
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-kid-yellow" />
                        <Badge className={`bg-gradient-to-r ${game.gradient} text-white border-0 text-sm font-bold`}>
                          Level {currentGameLevel}
                        </Badge>
            </div>
          </div>
                    
                    <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                    <p className="text-muted-foreground mb-2">{game.description}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">Current Level:</span>
                        <span className="text-kid-blue font-bold">{levelConfig.name}</span>
            </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {levelConfig.description}
              </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>Need {levelConfig.requiredScore}/5 to advance</span>
                        <span>{currentGameLevel}/{maxLevel}</span>
            </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                      <Coins className="h-4 w-4 text-kid-orange" />
                      <span>Costs 1 credit • Earn up to 3 credits!</span>
        </div>

                <Button
                      className={`w-full bg-gradient-to-r ${game.gradient} text-white hover:opacity-90 transition-opacity shadow-md`}
                      onClick={(e) => {
                        e.stopPropagation();
                        startGame(game.id);
                      }}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Play Level {currentGameLevel}
                </Button>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : !gameCompleted ? (
          /* Game Play */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Question Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-6 shadow-lg border-4 border-kid-blue/40 bg-white/95">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-kid-blue">
                      {GAMES.find(g => g.id === selectedGame)?.title}
                    </h2>
                    <Badge className="bg-gradient-to-r from-kid-yellow to-orange-500 text-white border-0 flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Level {currentLevel}
                    </Badge>
              </div>
              
                  <div className="text-sm text-kid-purple font-medium mb-2">
                    {currentLevelConfig?.name} - {currentLevelConfig?.description}
            </div>

                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                    <div className="flex gap-1">
                      {questions.map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i <= currentQuestionIndex 
                              ? 'text-kid-yellow fill-kid-yellow' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                  </div>
                    </div>
                  </div>
                  
                  <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-foreground mb-6 p-8 bg-kid-blue/10 rounded-2xl border-2 border-kid-blue/20">
                    {currentQuestion?.question} = ?
                  </div>

                      <input
                        type="number"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Your answer"
                    className="text-3xl text-center p-4 border-4 border-kid-blue/40 rounded-xl w-48 focus:border-kid-blue focus:outline-none shadow-lg"
                        autoFocus
                      />
                </div>

                      <Button
                  onClick={handleAnswer}
                  disabled={userInput === ''}
                  className="w-full bg-gradient-to-r from-kid-blue to-blue-500 text-white hover:opacity-90 transition-opacity text-lg py-4 rounded-xl shadow-lg"
                >
                  {isLastQuestion ? 'Finish Level!' : 'Submit Answer'}
                      </Button>

                <Button
                  variant="outline"
                  onClick={resetGame}
                  className="w-full mt-4 border-2 border-kid-blue/40 hover:bg-kid-blue/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Games
                </Button>
              </Card>
            </motion.div>

            {/* Progress Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="p-6 shadow-lg border-4 border-kid-pink/40 bg-white/95">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-kid-pink mb-2">Your Progress</h3>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-kid-yellow" />
                    <span className="text-lg font-semibold">Score: {score}/{questions.length}</span>
              </div>
                  
                  {currentLevelConfig && (
                    <div className="mt-3 p-3 bg-kid-yellow/20 rounded-lg border border-kid-yellow/40">
                      <div className="text-sm font-medium text-kid-orange">
                        Need {currentLevelConfig.requiredScore}/5 to level up!
                </div>
                </div>
                  )}
            </div>
            
                <div className="space-y-3">
                  {questions.map((q, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        index === currentQuestionIndex
                          ? 'border-kid-blue bg-kid-blue/20 scale-105'
                          : index < currentQuestionIndex
                          ? q.isCorrect
                            ? 'border-green-400 bg-green-50'
                            : 'border-red-400 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {index + 1}. {q.question} = 
                        </span>
                        {q.userAnswer !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className={q.isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {q.userAnswer}
                            </span>
                            {q.isCorrect ? (
                              <span className="text-green-600">✅</span>
                            ) : (
                              <span className="text-red-600">❌ ({q.answer})</span>
                            )}
            </div>
                        ) : index === currentQuestionIndex ? (
                          <span className="text-kid-blue animate-pulse">❓</span>
                        ) : (
                          <span className="text-gray-400">⏳</span>
                        )}
          </div>
                    </div>
                  ))}
              </div>

                {score >= (currentLevelConfig?.requiredScore || 3) && currentQuestionIndex >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-gradient-to-r from-kid-yellow/20 to-kid-orange/20 rounded-xl border-2 border-kid-yellow/40 text-center"
                  >
                    <span className="text-kid-orange font-semibold">
                      🎉 You're doing great! Level up incoming!
                    </span>
                  </motion.div>
                )}
              </Card>
            </motion.div>
                </div>
              ) : (
          /* Game Complete */
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto"
          >
            <Card className="p-8 shadow-lg border-4 border-kid-yellow/40 bg-white/95 text-center">
              <AnimatePresence>
                {leveledUp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: -50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="mb-6 p-4 bg-gradient-to-r from-kid-yellow to-orange-500 rounded-xl text-white"
                  >
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-2">
                      <ChevronUp className="h-6 w-6" />
                      LEVEL UP!
                      <ChevronUp className="h-6 w-6" />
                  </div>
                    <div className="text-lg">
                      Welcome to Level {currentLevel + 1}!
                </div>
                  </motion.div>
              )}
              </AnimatePresence>
              
              <div className="text-6xl mb-4">
                {leveledUp ? '🏆' : score >= 4 ? '🏆' : score >= 3 ? '🎉' : score >= 2 ? '👍' : '💪'}
            </div>
              
              <h2 className="text-3xl font-bold text-kid-blue mb-4">
                {leveledUp ? 'Level Complete!' : score >= 4 ? 'Amazing!' : score >= 3 ? 'Great Job!' : score >= 2 ? 'Good Try!' : 'Keep Practicing!'}
              </h2>
              
              <div className="text-2xl font-semibold mb-6">
                Final Score: {score} / 5
          </div>

              {currentLevelConfig && !leveledUp && score < currentLevelConfig.requiredScore && (
                <div className="bg-kid-blue/20 p-4 rounded-xl border-2 border-kid-blue/40 mb-6">
                  <div className="text-kid-blue font-semibold">
                    Need {currentLevelConfig.requiredScore - score} more correct to level up!
            </div>
            </div>
              )}
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => startGame(selectedGame)}
                  className="bg-gradient-to-r from-kid-blue to-blue-500 text-white hover:opacity-90 transition-opacity"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {leveledUp ? `Play Level ${currentLevel + 1}` : 'Try Again'}
                </Button>
                
                  <Button
                  variant="outline"
                  onClick={resetGame}
                  className="border-2 border-kid-blue/40 hover:bg-kid-blue/10"
                  >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Choose Different Game
                  </Button>
                </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MathPage; 