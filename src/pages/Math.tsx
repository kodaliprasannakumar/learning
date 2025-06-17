import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Star, 
  Trophy, 
  Heart,
  Sparkles,
  Sun,
  CloudRain,
  Zap,
  Gift,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { NumberGarden } from '@/components/games/NumberGarden';
import { MATH_GAME_CONFIG } from '@/constants';
import confetti from 'canvas-confetti';

interface MathQuestion {
  question: string;
  answer: number;
  options: number[];
  explanation: string;
}

interface GameState {
  currentQuestion: number;
  score: number;
  lives: number;
  streak: number;
  questions: MathQuestion[];
  isGameActive: boolean;
  showExplanation: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
}

const Math: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    lives: 3,
    streak: 0,
    questions: [],
    isGameActive: false,
    showExplanation: false,
    selectedAnswer: null,
    isCorrect: null,
  });

  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'stormy'>('sunny');
  const [showGarden, setShowGarden] = useState(false);

  // Generate math questions
  const generateQuestions = (): MathQuestion[] => {
    const questions: MathQuestion[] = [];
    const operations = ['+', '-', '×', '÷'];
    
    for (let i = 0; i < 10; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)];
      let num1, num2, answer, question;
      
      switch (operation) {
        case '+':
          num1 = Math.floor(Math.random() * 20) + 1;
          num2 = Math.floor(Math.random() * 20) + 1;
          answer = num1 + num2;
          question = `${num1} + ${num2} = ?`;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 20) + 10;
          num2 = Math.floor(Math.random() * 10) + 1;
          answer = num1 - num2;
          question = `${num1} - ${num2} = ?`;
          break;
        case '×':
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          answer = num1 * num2;
          question = `${num1} × ${num2} = ?`;
          break;
        case '÷':
          answer = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 5) + 2;
          num1 = answer * num2;
          question = `${num1} ÷ ${num2} = ?`;
          break;
        default:
          answer = 0;
          question = '';
      }

      // Generate wrong options
      const wrongOptions = [];
      while (wrongOptions.length < 3) {
        const wrong = answer + Math.floor(Math.random() * 10) - 5;
        if (wrong !== answer && wrong > 0 && !wrongOptions.includes(wrong)) {
          wrongOptions.push(wrong);
        }
      }

      const options = [...wrongOptions, answer].sort(() => Math.random() - 0.5);
      
      questions.push({
        question,
        answer,
        options,
        explanation: `The correct answer is ${answer}! Great job! 🌟`
      });
    }
    
    return questions;
  };

  const startGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      lives: 3,
      streak: 0,
      questions: generateQuestions(),
      isGameActive: true,
      showExplanation: false,
      selectedAnswer: null,
      isCorrect: null,
    });
    setShowGarden(false);
  };

  const selectAnswer = (answer: number) => {
    if (gameState.showExplanation) return;

    setGameState(prev => ({ ...prev, selectedAnswer: answer }));
    
    const correct = answer === gameState.questions[gameState.currentQuestion].answer;
    setGameState(prev => ({ ...prev, isCorrect: correct, showExplanation: true }));

    if (correct) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 10,
        streak: prev.streak + 1
      }));
      
      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Change weather based on streak
      if (gameState.streak >= 3) setWeather('sunny');
    } else {
      setGameState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        streak: 0
      }));
      
      if (gameState.streak >= 2) setWeather('rainy');
      if (gameState.lives <= 1) setWeather('stormy');
    }
  };

  const nextQuestion = () => {
    if (gameState.currentQuestion < gameState.questions.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        showExplanation: false,
        selectedAnswer: null,
        isCorrect: null
      }));
    } else {
      // Game completed
      setGameState(prev => ({ ...prev, isGameActive: false }));
      setShowGarden(true);
    }
  };

  const resetGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      lives: 3,
      streak: 0,
      questions: [],
      isGameActive: false,
      showExplanation: false,
      selectedAnswer: null,
      isCorrect: null,
    });
    setShowGarden(false);
    setWeather('sunny');
  };

  // Weather icon
  const WeatherIcon = () => {
    switch (weather) {
      case 'sunny': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'stormy': return <Zap className="h-8 w-8 text-purple-500" />;
    }
  };

  if (showGarden) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-4 pt-40">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text">
              🌟 Amazing Work! 🌟
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              You scored {gameState.score} points! Your garden is growing! 🌱
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={resetGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white px-8 py-4 text-lg rounded-full"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Play Again
              </Button>
            </div>
          </motion.div>
          
          <NumberGarden />
        </div>
      </div>
    );
  }

  if (!gameState.isGameActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 p-4 pt-40">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12"
          >
            <div className="mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Calculator className="h-12 w-12 text-white" />
              </motion.div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-transparent bg-clip-text">
                Math Garden Adventure! 🌺
              </h1>
              
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                Solve math problems to grow your magical garden! 
                Each correct answer plants a beautiful flower! 🌸
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:opacity-90 text-white px-12 py-6 text-2xl rounded-full shadow-xl"
              >
                <Sparkles className="mr-3 h-8 w-8" />
                Start Adventure!
              </Button>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-purple-200">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">Earn Points</h3>
                <p className="text-gray-600">Get 10 points for each correct answer!</p>
              </Card>
              
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-pink-200">
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">3 Lives</h3>
                <p className="text-gray-600">Be careful! You have 3 chances.</p>
              </Card>
              
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-orange-200">
                <Gift className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">Grow Garden</h3>
                <p className="text-gray-600">Watch your garden bloom with each win!</p>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQ = gameState.questions[gameState.currentQuestion];
  const progress = ((gameState.currentQuestion + 1) / gameState.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4 pt-40">
      <div className="container mx-auto max-w-4xl">
        {/* Header Stats */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <WeatherIcon />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{gameState.score}</div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i}
                className={`h-8 w-8 ${i < gameState.lives ? 'text-red-500 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{gameState.streak}</div>
            <div className="text-sm text-gray-600">Streak</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-gray-700">
              Question {gameState.currentQuestion + 1} of {gameState.questions.length}
            </span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-3 bg-white/50" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={gameState.currentQuestion}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 mb-8 bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                  {currentQ.question}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {currentQ.options.map((option, index) => (
                  <motion.div key={option} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => selectAnswer(option)}
                      disabled={gameState.showExplanation}
                      className={`
                        w-full p-6 text-2xl font-bold rounded-2xl transition-all duration-200
                        ${gameState.selectedAnswer === option
                          ? gameState.isCorrect
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                          : option === currentQ.answer && gameState.showExplanation
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                        }
                      `}
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {gameState.showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                  >
                    <div className={`p-6 rounded-2xl ${gameState.isCorrect ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'}`}>
                      <div className="text-4xl mb-2">
                        {gameState.isCorrect ? '🎉' : '😊'}
                      </div>
                      <p className="text-lg font-semibold text-gray-800">
                        {gameState.isCorrect ? 'Awesome! You got it right!' : "Don't worry! Let's try the next one!"}
                      </p>
                      <p className="text-gray-600 mt-2">{currentQ.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {gameState.showExplanation && (
                <div className="text-center">
                  <Button
                    onClick={nextQuestion}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-8 py-4 text-lg rounded-full"
                  >
                    {gameState.currentQuestion < gameState.questions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      <>
                        See My Garden!
                        <Sparkles className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Math;
