import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Calculator, 
  Target, 
  Timer, 
  Star, 
  Trophy, 
  ArrowLeft,
  Coins,
  Shapes,
  Clock,
  Zap,
  Heart,
  Plus,
  Minus,
  X,
  Divide,
  Equal,
  Shuffle,
  CheckCircle,
  XCircle,
  Flower,
  Flower2,
  Sprout,
  Sun,
  CloudRain,
  Sparkles,
  TreePine,
  Bug,
  Bird,
  Gift,
  Medal,
  Crown
} from "lucide-react";

interface PlantedFlower {
  id: number;
  x: number;
  y: number;
  stage: 'seed' | 'sprout' | 'flower';
  type: 'daisy' | 'rose' | 'sunflower' | 'tulip' | 'hibiscus' | 'blossom';
  color: string;
  plantedAt: number;
}

interface NumberGardenState {
  flowers: PlantedFlower[];
  seeds: number;
  waterLevel: number;
  sunLevel: number;
  gardenScore: number;
  streak: number;
  level: number;
}

export default function Math() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Number Garden specific state
  const [gardenState, setGardenState] = useState<NumberGardenState>({
    flowers: [],
    seeds: 5,
    waterLevel: 100,
    sunLevel: 80,
    gardenScore: 0,
    streak: 0,
    level: 1
  });
  const [selectedPlantingSpot, setSelectedPlantingSpot] = useState<{x: number, y: number} | null>(null);
  const [isPlanting, setIsPlanting] = useState(false);
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'rainy'>('sunny');
  const [gardenAnimations, setGardenAnimations] = useState<string[]>([]);
  
  // Reward system state
  const [showReward, setShowReward] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [aiCongratulations, setAiCongratulations] = useState("");
  const [rewardAnimations, setRewardAnimations] = useState<string[]>([]);

  const mathGames = [
    {
      id: 'number-garden',
      title: 'Number Garden',
      description: 'Plant seeds and grow beautiful flowers by solving addition and subtraction problems!',
      icon: Target,
      color: 'from-green-500 via-emerald-500 to-teal-600',
      bgColor: 'from-green-50 via-emerald-50 to-teal-100',
      difficulty: 'Easy',
      ages: '5-8 years'
    },
    {
      id: 'math-monsters',
      title: 'Math Monsters',
      description: 'Defeat friendly monsters by solving multiplication and division challenges!',
      icon: Zap,
      color: 'from-purple-500 via-violet-500 to-indigo-600',
      bgColor: 'from-purple-50 via-violet-50 to-indigo-100',
      difficulty: 'Medium',
      ages: '8-12 years'
    },
    {
      id: 'shape-builder',
      title: 'Shape Builder',
      description: 'Build amazing structures while learning about geometry and shapes!',
      icon: Shapes,
      color: 'from-blue-500 via-cyan-500 to-sky-600',
      bgColor: 'from-blue-50 via-cyan-50 to-sky-100',
      difficulty: 'Easy',
      ages: '6-10 years'
    },
    {
      id: 'time-master',
      title: 'Time Master',
      description: 'Race against time to solve problems and become a math speedster!',
      icon: Clock,
      color: 'from-orange-500 via-amber-500 to-yellow-600',
      bgColor: 'from-orange-50 via-amber-50 to-yellow-100',
      difficulty: 'Hard',
      ages: '9+ years'
    },
    {
      id: 'money-market',
      title: 'Money Market',
      description: 'Learn about coins, bills, and making change while running your own store!',
      icon: Coins,
      color: 'from-pink-500 via-rose-500 to-red-600',
      bgColor: 'from-pink-50 via-rose-50 to-red-100',
      difficulty: 'Medium',
      ages: '7-11 years'
    }
  ];

  const flowerTypes = [
    { type: 'daisy', emoji: '🌼', color: 'text-white', bgColor: 'bg-yellow-400' },
    { type: 'rose', emoji: '🌹', color: 'text-red-500', bgColor: 'bg-red-100' },
    { type: 'sunflower', emoji: '🌻', color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    { type: 'tulip', emoji: '🌷', color: 'text-purple-500', bgColor: 'bg-purple-100' },
    { type: 'hibiscus', emoji: '🌺', color: 'text-pink-500', bgColor: 'bg-pink-100' },
    { type: 'blossom', emoji: '🌸', color: 'text-pink-400', bgColor: 'bg-pink-50' }
  ];

  const calculateCoins = (gardenState: NumberGardenState, score: number) => {
    // Simple 1 coin reward for completing the game
    return 1;
  };

  const generateAICongratulations = (gardenState: NumberGardenState, score: number, coins: number) => {
    const flowers = gardenState.flowers.filter(f => f.stage === 'flower').length;
    const sprouts = gardenState.flowers.filter(f => f.stage === 'sprout').length;
    const streak = gardenState.streak;
    
    const congratsMessages = [
      `🌟 Great job, young gardener! You grew ${flowers} beautiful flowers and earned your golden coin!`,
      `🎉 Amazing work! Your ${flowers} blooming flowers show your math skills. Here's your reward coin!`,
      `🌺 Wonderful gardening! Your garden with ${flowers} flowers and ${sprouts} sprouts is fantastic!`,
      `🏆 Excellent job! Your ${flowers} beautiful blooms earned you a treasure coin!`,
      `✨ Fantastic! You transformed seeds into ${flowers} gorgeous flowers through math magic!`
    ];
    
    if (streak > 5) {
      return `🔥 Amazing ${streak} question streak! ` + congratsMessages[globalThis.Math.floor(globalThis.Math.random() * congratsMessages.length)];
    } else if (score >= 100) {
      return `💯 Perfect score! ` + congratsMessages[globalThis.Math.floor(globalThis.Math.random() * congratsMessages.length)];
    } else if (flowers >= 5) {
      return `🌻 Master gardener! ` + congratsMessages[globalThis.Math.floor(globalThis.Math.random() * congratsMessages.length)];
    } else {
      return congratsMessages[globalThis.Math.floor(globalThis.Math.random() * congratsMessages.length)];
    }
  };

  const generateQuestions = (gameType: string) => {
    const newQuestions = [];
    for (let i = 0; i < 10; i++) {
      let question;
      switch (gameType) {
        case 'number-garden':
          const a = globalThis.Math.floor(globalThis.Math.random() * 15) + 1;
          const b = globalThis.Math.floor(globalThis.Math.random() * 15) + 1;
          const operation = globalThis.Math.random() > 0.5 ? '+' : '-';
          if (operation === '+') {
            question = {
              text: `${a} + ${b} = ?`,
              answer: a + b,
              explanation: `🌱 Perfect! ${a} + ${b} = ${a + b}. Your seed is sprouting!`,
              gardenReward: 'seed'
            };
          } else {
            const larger = globalThis.Math.max(a, b);
            const smaller = globalThis.Math.min(a, b);
            question = {
              text: `${larger} - ${smaller} = ?`,
              answer: larger - smaller,
              explanation: `🌸 Wonderful! ${larger} - ${smaller} = ${larger - smaller}. Your garden is blooming!`,
              gardenReward: 'water'
            };
          }
          break;
        case 'math-monsters':
          const x = globalThis.Math.floor(globalThis.Math.random() * 12) + 1;
          const y = globalThis.Math.floor(globalThis.Math.random() * 12) + 1;
          const op = globalThis.Math.random() > 0.5 ? '×' : '÷';
          if (op === '×') {
            question = {
              text: `${x} × ${y} = ?`,
              answer: x * y,
              explanation: `${x} × ${y} = ${x * y}. Monster defeated!`
            };
          } else {
            const product = x * y;
            question = {
              text: `${product} ÷ ${x} = ?`,
              answer: y,
              explanation: `${product} ÷ ${x} = ${y}. Well done, hero!`
            };
          }
          break;
        case 'time-master':
          const nums = [globalThis.Math.floor(globalThis.Math.random() * 50) + 10, globalThis.Math.floor(globalThis.Math.random() * 50) + 10];
          const ops = ['+', '-', '×'][globalThis.Math.floor(globalThis.Math.random() * 3)];
          let result;
          switch (ops) {
            case '+': result = nums[0] + nums[1]; break;
            case '-': result = globalThis.Math.abs(nums[0] - nums[1]); break;
            case '×': result = nums[0] * nums[1]; break;
            default: result = nums[0] + nums[1];
          }
          question = {
            text: `${nums[0]} ${ops} ${nums[1]} = ?`,
            answer: result,
            explanation: `${nums[0]} ${ops} ${nums[1]} = ${result}. Lightning fast!`
          };
          break;
        default:
          question = {
            text: "2 + 2 = ?",
            answer: 4,
            explanation: "2 + 2 = 4. Keep practicing!"
          };
      }
      newQuestions.push(question);
    }
    return newQuestions;
  };

  const startGame = (gameId: string) => {
    setSelectedGame(gameId);
    setScore(0);
    setLives(3);
    setCurrentQuestion(0);
    setGameActive(true);
    setUserAnswer("");
    setFeedback(null);
    setTimeLeft(gameId === 'time-master' ? 15 : gameId === 'number-garden' ? 0 : 30);
    setQuestions(generateQuestions(gameId));
    
    // Initialize Number Garden specific state
    if (gameId === 'number-garden') {
      setGardenState({
        flowers: [],
        seeds: 5,
        waterLevel: 100,
        sunLevel: 80,
        gardenScore: 0,
        streak: 0,
        level: 1
      });
      setWeather('sunny');
    }
  };

  const plantFlower = (x: number, y: number) => {
    if (gardenState.seeds > 0) {
      const selectedFlowerType = flowerTypes[globalThis.Math.floor(globalThis.Math.random() * flowerTypes.length)];
      const newFlower: PlantedFlower = {
        id: Date.now(),
        x,
        y,
        stage: 'seed',
        type: selectedFlowerType.type as any,
        color: selectedFlowerType.emoji,
        plantedAt: Date.now()
      };
      
      const isFirstSeed = gardenState.flowers.length === 0;
      
      setGardenState(prev => ({
        ...prev,
        flowers: [...prev.flowers, newFlower],
        seeds: prev.seeds - 1
      }));
      
      // Start timer when first seed is planted
      if (isFirstSeed) {
        setTimeLeft(30);
      }
      
      setGardenAnimations(prev => [...prev, `planted-${newFlower.id}`]);
      setTimeout(() => {
        setGardenAnimations(prev => prev.filter(anim => anim !== `planted-${newFlower.id}`));
      }, 2000);
    }
  };

  const growFlower = (flowerId: number) => {
    setGardenState(prev => ({
      ...prev,
      flowers: prev.flowers.map(flower => {
        if (flower.id === flowerId) {
          const nextStage = flower.stage === 'seed' ? 'sprout' : flower.stage === 'sprout' ? 'flower' : 'flower';
          return { ...flower, stage: nextStage };
        }
        return flower;
      })
    }));
  };

  const submitAnswer = () => {
    const correct = parseInt(userAnswer) === questions[currentQuestion]?.answer;
    
    if (correct) {
      setScore(score + 10);
      setFeedback(questions[currentQuestion].explanation);
      
      // Number Garden specific rewards
      if (selectedGame === 'number-garden') {
        const currentFlowers = gardenState.flowers;
        if (currentFlowers.length > 0) {
          // Grow a random flower
          const growableFlowers = currentFlowers.filter(f => f.stage !== 'flower');
          if (growableFlowers.length > 0) {
            const randomFlower = growableFlowers[globalThis.Math.floor(globalThis.Math.random() * growableFlowers.length)];
            growFlower(randomFlower.id);
          }
        }
        
        setGardenState(prev => ({
          ...prev,
          seeds: prev.seeds + 1,
          gardenScore: prev.gardenScore + 10,
          streak: prev.streak + 1,
          waterLevel: globalThis.Math.min(100, prev.waterLevel + 10)
        }));
      }
      
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setUserAnswer("");
          setFeedback(null);
          setTimeLeft(selectedGame === 'time-master' ? 15 : 30);
        } else {
          setGameActive(false);
          if (selectedGame === 'number-garden') {
            // Calculate rewards
            const totalCoins = calculateCoins(gardenState, score + 10);
            const congratsMessage = generateAICongratulations(gardenState, score + 10, totalCoins);
            
            setCoinsEarned(totalCoins);
            setAiCongratulations(congratsMessage);
            setShowReward(true);
            
            // Trigger coin animations
            setRewardAnimations(['coins-falling']);
            setTimeout(() => setRewardAnimations([]), 2000);
          } else {
            setFeedback(`🎉 Game Complete! Final Score: ${score + 10}/100`);
          }
        }
      }, 2000);
    } else {
      setLives(lives - 1);
      setFeedback(`Oops! The answer was ${questions[currentQuestion]?.answer}. Your garden needs more care!`);
      
      if (selectedGame === 'number-garden') {
        setGardenState(prev => ({
          ...prev,
          streak: 0,
          waterLevel: globalThis.Math.max(0, prev.waterLevel - 20)
        }));
      }
      
      setTimeout(() => {
        if (lives > 1 && currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setUserAnswer("");
          setFeedback(null);
          setTimeLeft(selectedGame === 'time-master' ? 15 : 30);
        } else {
          setGameActive(false);
          if (selectedGame === 'number-garden') {
            // Give 1 coin even for game over - good effort!
            const totalCoins = 1;
            const congratsMessage = `🌱 Good effort! Your garden grew ${gardenState.flowers.filter(f => f.stage === 'flower').length} flowers. Here's your coin for trying! Keep practicing to grow an even more beautiful garden!`;
            
            setCoinsEarned(totalCoins);
            setAiCongratulations(congratsMessage);
            setShowReward(true);
            
            // Trigger coin animations
            setRewardAnimations(['coins-falling']);
            setTimeout(() => setRewardAnimations([]), 2000);
          } else {
            setFeedback(`Game Over! Final Score: ${score}/100`);
          }
        }
      }, 2000);
    }
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0 && selectedGame === 'number-garden') {
      // Only start timer for Number Garden after seeds are planted
      const hasPlantedSeeds = gardenState.flowers.length > 0;
      if (hasPlantedSeeds) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      }
    } else if (gameActive && timeLeft > 0 && selectedGame !== 'number-garden') {
      // Other games work normally
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && timeLeft === 0 && gardenState.flowers.length > 0) {
      // Only submit answer when timer runs out AND we have planted seeds
      submitAnswer();
    }
  }, [timeLeft, gameActive, gardenState.flowers.length, selectedGame]);

  // Weather effects for Number Garden
  useEffect(() => {
    if (selectedGame === 'number-garden' && gameActive) {
      const weatherInterval = setInterval(() => {
        const weathers: ('sunny' | 'cloudy' | 'rainy')[] = ['sunny', 'sunny', 'cloudy', 'rainy'];
        setWeather(weathers[globalThis.Math.floor(globalThis.Math.random() * weathers.length)]);
      }, 10000);
      
      return () => clearInterval(weatherInterval);
    }
  }, [selectedGame, gameActive]);

  // Number Garden Game Interface
  if (selectedGame === 'number-garden' && showReward) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-green-100 to-green-200 relative overflow-hidden">
        {/* Garden background (blurred) */}
        <div className="absolute inset-0 filter blur-sm opacity-50">
          {/* Same garden background as game */}
          <div className="container mx-auto max-w-6xl p-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-20">
              <div className="bg-gradient-to-b from-green-400 to-green-600 rounded-3xl p-8 shadow-2xl border-4 border-green-700 relative overflow-hidden">
                <div className="h-64 bg-green-300/30 rounded-2xl p-4">
                  {/* Simplified garden display */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popup Modal */}
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-yellow-300 relative mx-auto my-auto">
            {/* Coin animation */}
            {rewardAnimations.includes('coins-falling') && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                      left: `${globalThis.Math.random() * 80 + 10}%`,
                      top: `${globalThis.Math.random() * 80 + 10}%`,
                      animationDelay: `${globalThis.Math.random() * 1}s`,
                      animationDuration: '2s'
                    }}
                  >
                    <Coins className="h-6 w-6 text-yellow-500 drop-shadow-lg" />
                  </div>
                ))}
              </div>
            )}

            {/* Modal Content */}
            <div className="text-center relative z-10">
              {/* Header */}
              <Medal className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-transparent bg-clip-text">
                🎉 Congratulations!
              </h1>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Garden Complete!
              </h2>

              {/* Single Coin Display */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Coins className="h-12 w-12 text-white animate-spin" style={{ animationDuration: '2s' }} />
                  <div className="text-4xl font-bold text-white">1</div>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Golden Coin Earned!
                </h3>
              </div>

              {/* AI Congratulations */}
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 mb-6 border-2 border-green-300">
                <p className="text-sm text-green-700 leading-relaxed font-medium">
                  {aiCongratulations}
                </p>
              </div>

              {/* Garden Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                  <div className="text-3xl mx-auto mb-2">🌺</div>
                  <div className="text-lg font-bold text-green-800">{gardenState.flowers.filter(f => f.stage === 'flower').length}</div>
                  <div className="text-xs text-green-600">Flowers</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <Star className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-lg font-bold text-blue-800">{gardenState.gardenScore}</div>
                  <div className="text-xs text-blue-600">Points</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-lg font-bold text-orange-800">{gardenState.streak}</div>
                  <div className="text-xs text-orange-600">Streak</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowReward(false);
                    setSelectedGame(null);
                    setGameActive(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 text-sm font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Math Games
                </Button>
                <Button
                  onClick={() => {
                    setShowReward(false);
                    startGame('number-garden');
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-3 text-sm font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Sprout className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedGame === 'number-garden' && gameActive) {
    const currentQ = questions[currentQuestion];
    const hasPlantedSeeds = gardenState.flowers.length > 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-green-100 to-green-200 relative overflow-hidden">
        {/* Sky and Weather */}
        <div className="absolute inset-0 pointer-events-none">
          {weather === 'sunny' && (
            <Sun className="absolute top-8 right-8 h-20 w-20 text-yellow-400 animate-pulse drop-shadow-lg" />
          )}
          {weather === 'cloudy' && (
            <div className="absolute top-6 right-6 flex gap-2">
              <div className="w-16 h-10 bg-gray-300 rounded-full opacity-80 shadow-lg"></div>
              <div className="w-20 h-12 bg-gray-400 rounded-full opacity-70 shadow-lg -ml-4"></div>
              <div className="w-14 h-8 bg-gray-300 rounded-full opacity-60 shadow-lg -ml-6 mt-2"></div>
            </div>
          )}
          {weather === 'rainy' && (
            <div className="absolute inset-0">
              <div className="absolute top-6 right-6 flex gap-2">
                <div className="w-16 h-10 bg-gray-500 rounded-full opacity-80 shadow-lg"></div>
                <div className="w-20 h-12 bg-gray-600 rounded-full opacity-70 shadow-lg -ml-4"></div>
              </div>
              <CloudRain className="absolute top-8 right-10 h-10 w-10 text-gray-600 z-10" />
              {/* Rain drops */}
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-6 bg-blue-400 opacity-70 animate-pulse rounded-full"
                  style={{
                    left: `${20 + globalThis.Math.random() * 60}%`,
                    top: `${10 + globalThis.Math.random() * 40}%`,
                    animationDelay: `${globalThis.Math.random() * 2}s`,
                    transform: 'rotate(10deg)'
                  }}
                ></div>
              ))}
            </div>
          )}
          
          {/* Flying birds */}
          <Bird className="absolute top-16 left-1/4 h-6 w-6 text-gray-600 animate-bounce opacity-70" style={{ animationDelay: '0s', animationDuration: '4s' }} />
          <Bird className="absolute top-24 right-1/3 h-5 w-5 text-gray-500 animate-bounce opacity-60" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          
          {/* Ground elements */}
          <Bug className="absolute bottom-20 left-8 h-4 w-4 text-green-700 animate-pulse opacity-60" />
          <div className="absolute bottom-16 right-12 w-2 h-2 bg-yellow-600 rounded-full opacity-50"></div>
          <div className="absolute bottom-14 left-20 w-1 h-1 bg-yellow-700 rounded-full opacity-40"></div>
        </div>

        <div className="container mx-auto max-w-6xl p-4 relative z-10">
          {/* Game Header */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-xl border border-white/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => {
                    setSelectedGame(null);
                    setGameActive(false);
                  }}
                  variant="outline"
                  className="rounded-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Garden
                </Button>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
                  🌻 Number Garden
                </h1>
              </div>
              
              {/* Garden Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-full">
                  <Sprout className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-800">{gardenState.seeds}</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-full">
                  <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                  <span className="font-bold text-blue-800">{gardenState.waterLevel}%</span>
                </div>
                <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-full">
                  <Star className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-800">{gardenState.gardenScore}</span>
                </div>
                {hasPlantedSeeds && (
                  <div className="flex items-center gap-2 bg-orange-100 px-3 py-2 rounded-full">
                    <Timer className="h-5 w-5 text-orange-600" />
                    <span className="font-bold text-orange-800">{timeLeft}s</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Streak Indicator */}
            {gardenState.streak > 0 && (
              <div className="mt-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-center font-bold">
                🔥 {gardenState.streak} Question Streak! Your garden is thriving!
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Garden Plot */}
            <div className="bg-gradient-to-b from-green-400 to-green-600 rounded-3xl p-8 shadow-2xl border-4 border-green-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-800/20"></div>
              
              <h3 className="text-2xl font-bold text-white mb-6 text-center relative z-10">
                🌱 Your Magical Garden
              </h3>
              
              {/* Garden Grid */}
              <div className="relative z-10 grid grid-cols-6 grid-rows-4 gap-2 h-64 bg-green-300/30 rounded-2xl p-4 border-2 border-green-500">
                {[...Array(24)].map((_, index) => {
                  const x = index % 6;
                  const y = globalThis.Math.floor(index / 6);
                  const flower = gardenState.flowers.find(f => 
                    globalThis.Math.abs(f.x - x) < 1 && globalThis.Math.abs(f.y - y) < 1
                  );
                  
                  return (
                    <div
                      key={index}
                      className="bg-green-200/50 rounded-lg border border-green-400 relative cursor-pointer hover:bg-green-300/70 transition-all duration-200 flex items-center justify-center"
                      onClick={() => !flower && gardenState.seeds > 0 && plantFlower(x, y)}
                    >
                      {flower ? (
                        <div className="relative animate-pulse">
                          {flower.stage === 'seed' && (
                            <div className="w-2 h-2 bg-yellow-800 rounded-full"></div>
                          )}
                          {flower.stage === 'sprout' && (
                            <div className="text-lg">🌱</div>
                          )}
                          {flower.stage === 'flower' && (
                            <div className="text-2xl animate-pulse">{flower.color}</div>
                          )}
                          {gardenAnimations.includes(`planted-${flower.id}`) && (
                            <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-400 animate-spin" />
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-40 hover:opacity-70">
                          <Plus className="h-4 w-4 text-green-700" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Garden Stats */}
              <div className="mt-4 grid grid-cols-3 gap-4 relative z-10">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold">{gardenState.flowers.filter(f => f.stage === 'flower').length}</div>
                  <div className="text-sm opacity-80">Flowers</div>
                </div>
                <div className="text-center text-white">
                  <div className="text-2xl font-bold">{gardenState.flowers.filter(f => f.stage === 'sprout').length}</div>
                  <div className="text-sm opacity-80">Sprouts</div>
                </div>
                <div className="text-center text-white">
                  <div className="text-2xl font-bold">{gardenState.flowers.filter(f => f.stage === 'seed').length}</div>
                  <div className="text-sm opacity-80">Seeds</div>
                </div>
              </div>
            </div>

            {/* Question Panel */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              {!hasPlantedSeeds ? (
                <div className="text-center space-y-6">
                  <div className="mb-8">
                    <Sprout className="h-16 w-16 mx-auto mb-4 text-green-600" />
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">
                      🌱 Welcome to Number Garden!
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Start your magical garden adventure by planting your first seed! Click on any empty spot in the garden plot to begin.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-green-800 mb-3">How to Play:</h4>
                    <div className="space-y-2 text-green-700">
                      <p>🌱 Plant seeds by clicking empty garden spots</p>
                      <p>🧮 Solve math problems to help your garden grow</p>
                      <p>🌸 Watch your seeds become beautiful flowers!</p>
                      <p>💧 Keep your water level up by getting answers right</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-100 rounded-2xl p-4 border-2 border-yellow-300">
                    <p className="text-yellow-800 font-semibold">
                      🎯 You have {gardenState.seeds} seeds ready to plant!
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      🧮 Solve to Grow Your Garden!
                    </h3>
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 mb-6">
                      <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        {currentQ?.text}
                      </h2>
                    </div>
                  </div>

                  {!feedback ? (
                    <div className="space-y-6">
                      <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && userAnswer && submitAnswer()}
                        className="text-3xl font-bold text-center bg-green-50 border-2 border-green-200 rounded-2xl p-4 w-full focus:border-green-500 focus:outline-none"
                        placeholder="Your answer..."
                        autoFocus
                      />
                      <Button
                        onClick={submitAnswer}
                        disabled={!userAnswer}
                        className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 text-white px-8 py-6 text-xl font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                      >
                        <Sprout className="mr-2 h-6 w-6" />
                        Plant & Grow!
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6 text-center">
                      <div className={`text-xl font-bold p-6 rounded-2xl ${
                        feedback.includes('🌱') || feedback.includes('🌸') || feedback.includes('Perfect') || feedback.includes('Wonderful')
                          ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                          : 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                      }`}>
                        {feedback}
                      </div>
                      
                      {/* Show garden progress */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
                        <div className="text-sm text-green-700 mb-2">Garden Progress</div>
                        <div className="flex justify-center gap-4">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center">
                              {i < gardenState.flowers.filter(f => f.stage === 'flower').length ? (
                                <div className="text-2xl animate-pulse">
                                  {gardenState.flowers.filter(f => f.stage === 'flower')[i]?.color || '🌸'}
                                </div>
                              ) : i < gardenState.flowers.length ? (
                                <div className="text-2xl">🌱</div>
                              ) : (
                                <div className="h-8 w-8 border-2 border-dashed border-green-300 rounded-full"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedGame && gameActive) {
    const currentQ = questions[currentQuestion];
    const currentGameData = mathGames.find(g => g.id === selectedGame);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="container mx-auto max-w-4xl">
          {/* Game Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 shadow-xl border border-white/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => {
                    setSelectedGame(null);
                    setGameActive(false);
                  }}
                  variant="outline"
                  className="rounded-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  {currentGameData?.title}
                </h1>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold text-lg">{score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-blue-500" />
                  <span className="font-bold text-lg">{timeLeft}s</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: lives }).map((_, i) => (
                    <Heart key={i} className="h-5 w-5 text-red-500 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {/* Question Card */}
          {currentQ && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
              <div className="mb-8">
                <h2 className="text-5xl font-bold text-gray-800 mb-6">
                  {currentQ.text}
                </h2>
              </div>

              {!feedback ? (
                <div className="space-y-6">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && userAnswer && submitAnswer()}
                    className="text-4xl font-bold text-center bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 w-48 mx-auto block focus:border-purple-500 focus:outline-none"
                    placeholder="?"
                    autoFocus
                  />
                  <Button
                    onClick={submitAnswer}
                    disabled={!userAnswer}
                    className={`bg-gradient-to-r ${currentGameData?.color} text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none`}
                  >
                    <CheckCircle className="mr-2 h-6 w-6" />
                    Submit Answer
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`text-2xl font-bold p-6 rounded-2xl ${
                    feedback.includes('🎉') || feedback.includes('Great') || feedback.includes('defeated') || feedback.includes('Lightning')
                      ? 'bg-green-100 text-green-800' 
                      : feedback.includes('Oops') 
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Link to="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="mb-8">
            <Calculator className="h-20 w-20 mx-auto mb-6 text-orange-600" />
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-transparent bg-clip-text">
              Math Adventure
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Embark on exciting mathematical journeys! Choose your adventure and level up your math skills while having tons of fun.
            </p>
          </div>

          <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Earn Points</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-500" />
              <span>Level Up</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <span>Have Fun</span>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {mathGames.map((game, index) => {
            const IconComponent = game.icon;
            return (
              <div
                key={game.id}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.bgColor} rounded-3xl transform group-hover:scale-105 transition-transform duration-300`}></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 h-full">
                  {/* Game Icon */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">
                      {game.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {game.description}
                    </p>
                    
                    {/* Game Details */}
                    <div className="flex justify-between items-center text-sm">
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        game.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {game.difficulty}
                      </span>
                      <span className="text-gray-500">{game.ages}</span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Button
                    onClick={() => startGame(game.id)}
                    className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90 text-white py-4 rounded-2xl font-semibold transform group-hover:scale-105 transition-all duration-200 shadow-lg`}
                  >
                    <Target className="mr-2 h-5 w-5" />
                    Start Adventure
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fun Math Facts */}
        <div className="mt-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-12 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-6">🧮 Fun Math Facts!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-3">🔢</div>
              <h3 className="font-bold mb-2">Zero is Amazing!</h3>
              <p className="text-sm opacity-90">Zero was invented around 5th century and changed math forever!</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-3">🍕</div>
              <h3 className="font-bold mb-2">Pizza Math</h3>
              <p className="text-sm opacity-90">A pizza with radius 'z' and height 'a' has volume π × z × z × a!</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">Perfect Practice</h3>
              <p className="text-sm opacity-90">Just 15 minutes of math practice daily can improve your skills by 40%!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 