// Core user and authentication types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

// Credit system types
export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earned' | 'spent';
  description: string;
  created_at: string;
}

// Game and activity types
export interface GameDifficulty {
  level: 'easy' | 'medium' | 'hard';
  minAge: number;
  maxAge: number;
}

export interface GameCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  difficulty: GameDifficulty;
}

// Math game specific types
export interface PlantedFlower {
  id: number;
  x: number;
  y: number;
  stage: 'seed' | 'sprout' | 'flower';
  type: 'daisy' | 'rose' | 'sunflower' | 'tulip' | 'hibiscus' | 'blossom';
  color: string;
  plantedAt: number;
}

export interface NumberGardenState {
  flowers: PlantedFlower[];
  seeds: number;
  waterLevel: number;
  sunLevel: number;
  gardenScore: number;
  streak: number;
  level: number;
}

export interface MathQuestion {
  text: string;
  answer: number;
  explanation: string;
  gardenReward?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// AI Trainer types
export interface TrainingData {
  input: string;
  output: string;
  category: string;
}

export interface ModelPerformance {
  accuracy: number;
  trainingProgress: number;
  predictions: number;
  correctPredictions: number;
}

export interface AIModel {
  id: string;
  name: string;
  type: 'text-classifier' | 'sentiment-analyzer' | 'pattern-recognizer';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  trainingData: TrainingData[];
  performance: ModelPerformance;
  isTraining: boolean;
  isTrained: boolean;
}

// Puzzle game types
export interface PuzzlePiece {
  id: string;
  text: string;
  order: number;
  position: { x: number; y: number };
  color: string;
  rotation: number;
  scale: number;
  isNew?: boolean;
}

// Doodle types
export interface DoodleData {
  id: string;
  user_id: string;
  title: string;
  style: string;
  image_url?: string;
  created_at: string;
}

// Story types
export interface StoryData {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// API response types
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Animation and UI types
export interface AnimationConfig {
  duration: number;
  delay?: number;
  type?: 'spring' | 'tween';
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
} 