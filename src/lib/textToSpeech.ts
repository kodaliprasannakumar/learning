/**
 * Text-to-Speech utility functions
 */

// Store the speech synthesis instance
let speechSynthesis: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Initialize speech synthesis
const initSpeechSynthesis = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis;
    return true;
  }
  return false;
};

/**
 * Speak the given text
 * @param text The text to speak
 * @param onEnd Callback function to execute when speech ends
 * @param onError Callback function to execute when speech errors
 * @returns A function to stop the speech
 */
export const speak = (
  text: string,
  onEnd?: () => void,
  onError?: (error: any) => void
): (() => void) => {
  // Initialize speech synthesis if not already done
  if (!speechSynthesis && !initSpeechSynthesis()) {
    console.error('Speech synthesis not supported in this browser');
    return () => {};
  }

  // Cancel any ongoing speech
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }

  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  // Set properties for better speech
  utterance.rate = 0.9; // Slightly slower than default
  utterance.pitch = 1.0; // Default pitch
  utterance.volume = 1.0; // Full volume

  // Try to use a child-friendly voice if available
  const voices = speechSynthesis?.getVoices() || [];
  const childVoice = voices.find(
    voice => 
      voice.name.includes('child') || 
      voice.name.includes('kid') || 
      voice.name.includes('young')
  );
  
  if (childVoice) {
    utterance.voice = childVoice;
  }

  // Set up event handlers
  utterance.onend = () => {
    if (onEnd) onEnd();
    currentUtterance = null;
  };

  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    if (onError) onError(event);
    currentUtterance = null;
  };

  // Start speaking
  speechSynthesis?.speak(utterance);

  // Return a function to stop the speech
  return () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      currentUtterance = null;
    }
  };
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = (): void => {
  if (speechSynthesis) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
};

/**
 * Check if speech synthesis is currently speaking
 * @returns Boolean indicating if speech is in progress
 */
export const isSpeaking = (): boolean => {
  return speechSynthesis?.speaking || false;
};

/**
 * Get all available voices
 * @returns Array of available voices
 */
export const getVoices = (): SpeechSynthesisVoice[] => {
  if (!speechSynthesis) {
    initSpeechSynthesis();
  }
  
  return speechSynthesis?.getVoices() || [];
};

// Load voices when they become available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    // This event fires when voices are loaded
    console.log('Voices loaded:', getVoices().length);
  };
} 