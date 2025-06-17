import { useState, useCallback, useEffect, useRef } from 'react';
import { GAME_CONFIG, CREDIT_COSTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { MathQuestion, LoadingState } from '@/types';
import { generateQuestionSet, calculateCoinsEarned } from '@/utils/gameUtils';
import { useCreditSystem } from './useCreditSystem';
import { toast } from 'sonner';

interface GameState {
  score: number;
  lives: number;
  currentQuestion: number;
  timeLeft: number;
  gameActive: boolean;
  questions: MathQuestion[];
  userAnswer: string;
  feedback: string | null;
  streak: number;
}

interface GameConfig {
  questionsPerGame?: number;
  timeLimit?: number;
  creditCost?: number;
  questionTypes?: Array<'addition' | 'subtraction' | 'multiplication' | 'division'>;
}

export const useGameState = (gameType: string, config: GameConfig = {}) => {
  const { credits, spendCredits, earnCredits } = useCreditSystem();
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: GAME_CONFIG.MAX_LIVES,
    currentQuestion: 0,
    timeLeft: config.timeLimit || GAME_CONFIG.DEFAULT_TIME_LIMIT,
    gameActive: false,
    questions: [],
    userAnswer: '',
    feedback: null,
    streak: 0,
  });

  // Initialize questions when game starts
  const initializeGame = useCallback(async () => {
    const creditCost = config.creditCost || CREDIT_COSTS.MATH_GAME;
    
    if (credits < creditCost) {
      toast.error(`${ERROR_MESSAGES.INSUFFICIENT_CREDITS}. You need ${creditCost} credits.`);
      return false;
    }

    setLoadingState({ isLoading: true });
    
    try {
      await spendCredits(creditCost, `Started ${gameType} game`);
      
      const questions = generateQuestionSet(
        config.questionsPerGame || GAME_CONFIG.QUESTIONS_PER_GAME,
        config.questionTypes || ['addition', 'subtraction']
      );
      
      setGameState(prev => ({
        ...prev,
        questions,
        gameActive: true,
        currentQuestion: 0,
        score: 0,
        lives: GAME_CONFIG.MAX_LIVES,
        timeLeft: config.timeLimit || GAME_CONFIG.DEFAULT_TIME_LIMIT,
        feedback: null,
        userAnswer: '',
        streak: 0,
      }));
      
      startTimer();
      toast.success(`Game started! You have ${questions.length} questions.`);
      return true;
    } catch (error) {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR);
      return false;
    } finally {
      setLoadingState({ isLoading: false });
    }
  }, [credits, spendCredits, gameType, config]);

  // Timer management
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          // Time's up - treat as wrong answer
          return {
            ...prev,
            timeLeft: 0,
            lives: prev.lives - 1,
            streak: 0,
            feedback: "⏰ Time's up! The correct answer was " + prev.questions[prev.currentQuestion]?.answer
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Answer submission
  const submitAnswer = useCallback(() => {
    const currentQ = gameState.questions[gameState.currentQuestion];
    if (!currentQ || !gameState.userAnswer.trim()) return;

    const userAnswerNum = parseInt(gameState.userAnswer);
    const isCorrect = userAnswerNum === currentQ.answer;
    
    setGameState(prev => ({
      ...prev,
      feedback: isCorrect ? currentQ.explanation : `❌ Not quite! The correct answer is ${currentQ.answer}`,
      score: isCorrect ? prev.score + (10 * (prev.streak + 1)) : prev.score,
      lives: isCorrect ? prev.lives : prev.lives - 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));

    // Auto-advance after showing feedback
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  }, [gameState.questions, gameState.currentQuestion, gameState.userAnswer, gameState.streak]);

  // Navigate to next question
  const nextQuestion = useCallback(() => {
    setGameState(prev => {
      const nextIndex = prev.currentQuestion + 1;
      
      if (nextIndex >= prev.questions.length || prev.lives <= 0) {
        // Game over
        stopTimer();
        endGame(prev);
        return {
          ...prev,
          gameActive: false,
          feedback: null,
        };
      }
      
      return {
        ...prev,
        currentQuestion: nextIndex,
        userAnswer: '',
        feedback: null,
        timeLeft: config.timeLimit || GAME_CONFIG.DEFAULT_TIME_LIMIT,
      };
    });
    
    // Restart timer for next question
    startTimer();
  }, [stopTimer, config.timeLimit]);

  // End game and calculate rewards
  const endGame = useCallback(async (finalState: GameState) => {
    stopTimer();
    
    const flowersGrown = Math.floor(finalState.score / 20); // Approximate flowers based on score
    const coinsEarned = calculateCoinsEarned(finalState.score, finalState.streak, flowersGrown);
    
    if (finalState.score >= GAME_CONFIG.MIN_SCORE_FOR_REWARD) {
      await earnCredits(coinsEarned, `Completed ${gameType} game`);
      toast.success(`${SUCCESS_MESSAGES.GAME_COMPLETED} Earned ${coinsEarned} credits!`);
    } else {
      toast.info("Game completed! Try to score higher next time for credit rewards.");
    }
  }, [stopTimer, earnCredits, gameType]);

  // Reset game
  const resetGame = useCallback(() => {
    stopTimer();
    setGameState({
      score: 0,
      lives: GAME_CONFIG.MAX_LIVES,
      currentQuestion: 0,
      timeLeft: config.timeLimit || GAME_CONFIG.DEFAULT_TIME_LIMIT,
      gameActive: false,
      questions: [],
      userAnswer: '',
      feedback: null,
      streak: 0,
    });
  }, [stopTimer, config.timeLimit]);

  // Update user answer
  const setUserAnswer = useCallback((answer: string) => {
    setGameState(prev => ({ ...prev, userAnswer: answer }));
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Check for game over conditions
  useEffect(() => {
    if (gameState.gameActive && (gameState.lives <= 0 || gameState.timeLeft <= 0)) {
      endGame(gameState);
    }
  }, [gameState.lives, gameState.timeLeft, gameState.gameActive, endGame]);

  return {
    gameState,
    loadingState,
    actions: {
      initializeGame,
      submitAnswer,
      nextQuestion,
      resetGame,
      setUserAnswer,
      stopTimer,
    },
    computed: {
      currentQuestion: gameState.questions[gameState.currentQuestion],
      progress: gameState.questions.length > 0 ? (gameState.currentQuestion / gameState.questions.length) * 100 : 0,
      isGameOver: !gameState.gameActive && gameState.questions.length > 0,
      canSubmit: gameState.userAnswer.trim() !== '' && gameState.gameActive,
    }
  };
}; 