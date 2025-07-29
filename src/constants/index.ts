// Credit system constants
export const CREDIT_COSTS = {
  DOODLE_GENERATION: 5,
  STORY_GENERATION: 3,
  AI_TRAINING: 5,
  AI_PREDICTION: 1,
  PUZZLE_QUESTION: 1,
  MATH_GAME: 2,
  QUIZ_ATTEMPT: 1,
} as const;

export const CREDIT_REWARDS = {
  COMPLETE_PUZZLE: 1,
  COMPLETE_MATH_GAME: 1,
  SHARE_CREATION: 2,
  PROFILE_SETUP: 10,
} as const;

// Game configuration
export const GAME_CONFIG = {
  MAX_LIVES: 3,
  DEFAULT_TIME_LIMIT: 30,
  QUESTIONS_PER_GAME: 10,
  MIN_SCORE_FOR_REWARD: 50,
} as const;

// Math game constants
export const MATH_GAME_CONFIG = {
  NUMBER_RANGE: {
    MIN: 1,
    MAX: 15,
  },
  GARDEN: {
    INITIAL_SEEDS: 5,
    INITIAL_WATER: 100,
    INITIAL_SUN: 80,
    MAX_FLOWERS: 20,
  },
  WEATHER_DURATION: 10000, // 10 seconds
} as const;

// Animation constants
export const ANIMATION_DURATIONS = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  VERY_SLOW: 1.0,
} as const;

// UI constants
export const UI_CONFIG = {
  MAX_CONTAINER_WIDTH: '7xl',
  DEFAULT_PADDING: 'p-6',
  CARD_PADDING: 'p-4',
  BUTTON_SIZES: {
    SM: 'h-8 px-3',
    MD: 'h-10 px-4',
    LG: 'h-12 px-6',
  },
  ICON_SIZES: {
    SM: 'w-4 h-4',
    MD: 'w-6 h-6',
    LG: 'w-8 h-8',
    XL: 'w-12 h-12',
  },
} as const;

// API endpoints and external service configs
export const API_CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  AWS_REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',
} as const;

// Validation constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_USERNAME_LENGTH: 30,
  MAX_STORY_LENGTH: 5000,
  MAX_DOODLE_TITLE_LENGTH: 100,
  ALLOWED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Color schemes for different features
export const COLOR_SCHEMES = {
  BLOCK_COLORS: [
    'bg-gradient-to-br from-emerald-400 to-emerald-600',
    'bg-gradient-to-br from-sky-400 to-sky-600',
    'bg-gradient-to-br from-amber-400 to-amber-600',
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-rose-400 to-rose-600',
    'bg-gradient-to-br from-indigo-400 to-indigo-600',
  ],
  FLOWER_TYPES: [
    { type: 'daisy', emoji: '🌼', color: 'text-white', bgColor: 'bg-yellow-400' },
    { type: 'rose', emoji: '🌹', color: 'text-red-500', bgColor: 'bg-red-100' },
    { type: 'sunflower', emoji: '🌻', color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    { type: 'tulip', emoji: '🌷', color: 'text-purple-500', bgColor: 'bg-purple-100' },
    { type: 'hibiscus', emoji: '🌺', color: 'text-pink-500', bgColor: 'bg-pink-100' },
    { type: 'blossom', emoji: '🌸', color: 'text-pink-400', bgColor: 'bg-pink-50' }
  ],
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'wizzle_user_preferences',
  LAST_VISITED_PATH: 'lastVisitedPath',
  INTENDED_PATH: 'intendedPath',
  THEME: 'theme',
  SOUND_ENABLED: 'soundEnabled',
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_SPEECH_SYNTHESIS: true,
  ENABLE_CONFETTI_ANIMATIONS: true,
  ENABLE_SOUND_EFFECTS: true,
  ENABLE_ANALYTICS: false,
  ENABLE_DEBUG_MODE: import.meta.env.DEV,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_CREDITS: 'You need more credits to perform this action',
  NETWORK_ERROR: 'Network error. Please check your connection',
  VALIDATION_ERROR: 'Please check your input and try again',
  UNAUTHORIZED: 'You need to be logged in to perform this action',
  GENERIC_ERROR: 'Something went wrong. Please try again',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CREDIT_EARNED: 'Credits earned!',
  GAME_COMPLETED: 'Great job! Game completed!',
  PROFILE_UPDATED: 'Profile updated successfully',
  CREATION_SAVED: 'Your creation has been saved!',
} as const; 