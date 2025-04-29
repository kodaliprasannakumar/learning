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
  AUTO = 'auto',       // Automatically choose the best provider
  DALLE = 'dalle',     // OpenAI's DALL-E 3
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
  provider: ImageProvider = ImageProvider.AUTO
): Promise<string> {
  try {
    // If provider is AUTO, determine which provider to use based on rate limits
    if (provider === ImageProvider.AUTO) {
      // Check if DALL-E is rate limited (5 requests per minute)
      if (DALLE_RATE_LIMIT.requestCount >= 5 || DALLE_RATE_LIMIT.isLimited) {
        console.log('DALL-E rate limited, using Stability AI');
        provider = ImageProvider.STABILITY;
      } else {
        provider = ImageProvider.DALLE;
      }
    }

    // Generate image with the selected provider
    let imageUrl: string;
    if (provider === ImageProvider.DALLE) {
      // Track DALL-E request count
      DALLE_RATE_LIMIT.requestCount++;
      if (DALLE_RATE_LIMIT.requestCount >= 5) {
        DALLE_RATE_LIMIT.isLimited = true;
      }

      // Use OpenAI integration
      // @ts-ignore - Assuming the structure matches even if TypeScript doesn't recognize it
      imageUrl = await openaiService.generateImageForStoryPage(
        character, 
        setting, 
        object, 
        text, 
        imageStyle
      );
    } else {
      // Use Stability AI integration
      imageUrl = await stabilityService.generateImageForStoryPage(
        character,
        setting,
        object,
        text,
        imageStyle
      );
    }

    return imageUrl;
  } catch (error) {
    console.error('Error in image generation service:', error);
    
    // If primary provider fails, try fallback
    if (provider === ImageProvider.DALLE) {
      console.log('DALL-E failed, falling back to Stability AI');
      return stabilityService.generateImageForStoryPage(
        character,
        setting,
        object,
        text,
        imageStyle
      );
    } else if (provider === ImageProvider.STABILITY) {
      console.log('Stability AI failed, falling back to DALL-E');
      // @ts-ignore - Assuming the structure matches
      return openaiService.generateImageForStoryPage(
        character,
        setting,
        object,
        text,
        imageStyle
      );
    }
    
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