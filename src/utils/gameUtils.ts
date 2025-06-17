import { MATH_GAME_CONFIG, COLOR_SCHEMES } from '@/constants';
import { MathQuestion, PlantedFlower, NumberGardenState } from '@/types';

/**
 * Generates a random math question based on the specified type
 */
export const generateMathQuestion = (type: 'addition' | 'subtraction' | 'multiplication' | 'division' = 'addition'): MathQuestion => {
  const { MIN, MAX } = MATH_GAME_CONFIG.NUMBER_RANGE;
  
  switch (type) {
    case 'addition': {
      const a = Math.floor(Math.random() * MAX) + MIN;
      const b = Math.floor(Math.random() * MAX) + MIN;
      return {
        text: `${a} + ${b} = ?`,
        answer: a + b,
        explanation: `🌱 Perfect! ${a} + ${b} = ${a + b}. Your seed is sprouting!`,
        gardenReward: 'seed',
        difficulty: 'easy'
      };
    }
    
    case 'subtraction': {
      const a = Math.floor(Math.random() * MAX) + MIN;
      const b = Math.floor(Math.random() * MAX) + MIN;
      const larger = Math.max(a, b);
      const smaller = Math.min(a, b);
      return {
        text: `${larger} - ${smaller} = ?`,
        answer: larger - smaller,
        explanation: `🌿 Excellent! ${larger} - ${smaller} = ${larger - smaller}. A flower blooms!`,
        gardenReward: 'water',
        difficulty: 'easy'
      };
    }
    
    case 'multiplication': {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      return {
        text: `${a} × ${b} = ?`,
        answer: a * b,
        explanation: `🌻 Amazing! ${a} × ${b} = ${a * b}. Your garden flourishes!`,
        gardenReward: 'sun',
        difficulty: 'medium'
      };
    }
    
    case 'division': {
      const b = Math.floor(Math.random() * 10) + 1;
      const answer = Math.floor(Math.random() * 10) + 1;
      const a = b * answer;
      return {
        text: `${a} ÷ ${b} = ?`,
        answer: answer,
        explanation: `🌺 Brilliant! ${a} ÷ ${b} = ${answer}. Perfect division!`,
        gardenReward: 'fertilizer',
        difficulty: 'hard'
      };
    }
    
    default:
      throw new Error(`Unknown question type: ${type}`);
  }
};

/**
 * Generates multiple math questions for a game session
 */
export const generateQuestionSet = (count: number, types: Array<'addition' | 'subtraction' | 'multiplication' | 'division'> = ['addition', 'subtraction']): MathQuestion[] => {
  const questions: MathQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomType = types[Math.floor(Math.random() * types.length)];
    questions.push(generateMathQuestion(randomType));
  }
  
  return questions;
};

/**
 * Calculates coins earned based on game performance
 */
export const calculateCoinsEarned = (score: number, streak: number, flowersGrown: number): number => {
  let baseCoins = 1;
  
  // Bonus for high scores
  if (score >= 100) baseCoins += 2;
  else if (score >= 75) baseCoins += 1;
  
  // Bonus for streaks
  if (streak >= 10) baseCoins += 2;
  else if (streak >= 5) baseCoins += 1;
  
  // Bonus for flowers grown
  if (flowersGrown >= 10) baseCoins += 2;
  else if (flowersGrown >= 5) baseCoins += 1;
  
  return baseCoins;
};

/**
 * Generates AI congratulations message based on performance
 */
export const generateCongratulationsMessage = (gardenState: NumberGardenState, score: number): string => {
  const flowers = gardenState.flowers.filter(f => f.stage === 'flower').length;
  const sprouts = gardenState.flowers.filter(f => f.stage === 'sprout').length;
  const streak = gardenState.streak;
  
  const congratsMessages = [
    `🌟 Great job, young gardener! You grew ${flowers} beautiful flowers!`,
    `🎉 Amazing work! Your ${flowers} blooming flowers show your math skills!`,
    `🌺 Wonderful gardening! Your garden with ${flowers} flowers and ${sprouts} sprouts is fantastic!`,
    `🏆 Excellent job! Your ${flowers} beautiful blooms earned you a treasure!`,
    `✨ Fantastic! You transformed seeds into ${flowers} gorgeous flowers through math magic!`
  ];
  
  if (streak > 5) {
    return `🔥 Amazing ${streak} question streak! ` + congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
  } else if (score >= 100) {
    return `💯 Perfect score! ` + congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
  } else if (flowers >= 5) {
    return `🌻 Master gardener! ` + congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
  } else {
    return congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
  }
};

/**
 * Creates a new flower for the garden
 */
export const createFlower = (x: number, y: number): PlantedFlower => {
  const flowerTypes = COLOR_SCHEMES.FLOWER_TYPES;
  const randomType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
  
  return {
    id: Date.now() + Math.random(),
    x,
    y,
    stage: 'seed',
    type: randomType.type as PlantedFlower['type'],
    color: randomType.color,
    plantedAt: Date.now()
  };
};

/**
 * Grows a flower to the next stage
 */
export const growFlower = (flower: PlantedFlower): PlantedFlower => {
  const stages: PlantedFlower['stage'][] = ['seed', 'sprout', 'flower'];
  const currentIndex = stages.indexOf(flower.stage);
  const nextStage = stages[Math.min(currentIndex + 1, stages.length - 1)];
  
  return {
    ...flower,
    stage: nextStage
  };
};

/**
 * Validates if coordinates are within bounds
 */
export const isValidPosition = (x: number, y: number, containerWidth: number, containerHeight: number): boolean => {
  return x >= 0 && x <= containerWidth - 100 && y >= 0 && y <= containerHeight - 40;
};

/**
 * Generates a random color from the block colors array
 */
export const getRandomBlockColor = (): string => {
  const colors = COLOR_SCHEMES.BLOCK_COLORS;
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Creates confetti effect at specified coordinates
 */
export const createConfettiEffect = (x: number, y: number, colors?: string[]) => {
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({
      particleCount: 20,
      spread: 50,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight
      },
      colors: colors || ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
    });
  }
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Shuffle array utility
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Check if user is on mobile device
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}; 