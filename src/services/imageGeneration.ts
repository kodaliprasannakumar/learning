/**
 * Image Generation Service
 * Provides unified interface for image generation with multiple providers and fallback
 */

import * as openaiService from '../integrations/openai';
import * as stabilityService from '../integrations/stabilityai';

// Store rate limit info for DALL-E
interface RateLimitInfo {
  requestCount: number;
  lastResetTime: number;
  isLimited: boolean;
}

const DALLE_RATE_LIMIT = {
  requestCount: 0,
  lastResetTime: Date.now(),
  isLimited: false,
};

// Reset rate limit counter every minute
setInterval(() => {
  DALLE_RATE_LIMIT.requestCount = 0;
  DALLE_RATE_LIMIT.lastResetTime = Date.now();
  DALLE_RATE_LIMIT.isLimited = false;
}, 60 * 1000); // 60 seconds

/**
 * Image generation providers
 */
export enum ImageProvider {
  STABILITY = 'stability', // Stability AI's Stable Diffusion
}

/**
 * Generates an image for a story page
 * @param character The character in the story
 * @param setting The setting of the story
 * @param object The key object in the story
 * @param text The text content of the page
 * @param imageStyle The style to apply to the image
 * @param provider The image provider to use
 * @returns Promise that resolves to an image URL
 */
export async function generateImage(
  character: string,
  setting: string,
  object: string,
  text: string,
  imageStyle: string = 'Cartoon',
  provider: ImageProvider = ImageProvider.STABILITY
): Promise<string> {
  try {
    // Generate image with Stability AI
    return await stabilityService.generateImageForStoryPage(
      character,
      setting,
      object,
      text,
      imageStyle
    );
  } catch (error) {
    console.error('Error in image generation service:', error);
    return '/placeholder.svg';
  }
}

/**
 * Check if the application has reached DALL-E rate limits
 * @returns Boolean indicating if DALL-E is currently rate limited
 */
export function isDalleRateLimited(): boolean {
  return DALLE_RATE_LIMIT.isLimited || DALLE_RATE_LIMIT.requestCount >= 5;
}

export default {
  generateImage,
  isDalleRateLimited,
  ImageProvider,
}; 