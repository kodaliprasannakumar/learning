/**
 * Stability AI API integration for image generation
 * This provides an alternative to DALL-E-3 with fewer rate limits
 * 
 * Integration options:
 * 1. Direct Stability AI API (default)
 * 2. Amazon Bedrock (commented implementation below)
 */

// Type definition for story elements (matching the OpenAI integration)
interface StoryElement {
  id: string;
  name: string;
  type: 'character' | 'setting' | 'object' | 'storyStyle' | 'imageStyle';
  image: string;
}

// Type definition for a story page
interface StoryPage {
  text: string;
  image: string;
}

// Simple in-memory cache for generated images
const imageCache: Record<string, string> = {};

// Check if the Stability API key is available
const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY;

// Check if AWS credentials are available for Bedrock
export const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
export const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-west-2';

/**
 * Generates an image using Stability AI's Stable Diffusion
 * @param prompt The text prompt to generate an image from
 * @returns Promise that resolves to an image URL
 */
async function generateImageWithStableDiffusion(prompt: string): Promise<string> {
  try {
    if (!STABILITY_API_KEY) {
      console.error("Stability API key not found");
      return '/placeholder.svg';
    }

    // Call the Stability API
    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    });

    if (!response.ok) {
      throw new Error(`Stability API error: ${response.statusText}`);
    }

    const responseData = await response.json();
    const base64Image = responseData.artifacts[0].base64;
    
    // Convert base64 to URL
    const imageUrl = `data:image/png;base64,${base64Image}`;
    return imageUrl;
  } catch (error) {
    console.error('Error generating image with Stable Diffusion:', error);
    return '/placeholder.svg'; // Fallback to placeholder
  }
}

/**
 * Generates an image using Amazon Bedrock's Stability AI models
 * @param prompt The text prompt to generate an image from
 * @returns Promise that resolves to an image URL
 */
async function generateImageWithBedrockStableDiffusion(prompt: string): Promise<string> {
  try {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.error("AWS credentials not found");
      return '/placeholder.svg';
    }

    // This requires AWS SDK v3 for JavaScript
    // npm install @aws-sdk/client-bedrock-runtime
    const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

    const client = new BedrockRuntimeClient({ 
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });

    // Using Stable Diffusion 3.5 Large model
    // Other options include: stability.stable-image-ultra-v1:1, stability.stable-image-core-v1:0
    const MODEL_ID = "stability.sd3-5-large-v1:0";

    const params = {
      modelId: MODEL_ID,
      body: JSON.stringify({
        prompt: prompt,
        mode: "text-to-image",
        aspect_ratio: "1:1",
        output_format: "jpeg",
        seed: Math.floor(Math.random() * 1000000)
      }),
    };

    const command = new InvokeModelCommand(params);
    const response = await client.send(command);
    
    // Use TextDecoder to handle the response instead of Buffer
    // response.body is a Uint8Array in the browser environment
    const decoder = new TextDecoder('utf-8');
    const responseText = decoder.decode(response.body);
    const modelResponse = JSON.parse(responseText);
    
    const base64Image = modelResponse.images[0];
    
    // Convert base64 to URL
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;
    return imageUrl;
  } catch (error) {
    console.error('Error generating image with Amazon Bedrock:', error);
    return '/placeholder.svg'; // Fallback to placeholder
  }
}

/**
 * Generates an image for a story page using Stable Diffusion
 * @param character The character in the story
 * @param setting The setting of the story
 * @param object The key object in the story
 * @param text The text content of the page
 * @param imageStyle The style to apply to the image
 * @returns Promise that resolves to an image URL
 */
async function generateImageForStoryPage(
  character: string,
  setting: string,
  object: string,
  text: string,
  imageStyle: string = 'Cartoon'
): Promise<string> {
  try {
    // Create a cache key based on the input parameters
    const cacheKey = `${character}-${setting}-${object}-${imageStyle}-${text.substring(0, 50)}`;
    
    // Check if we have a cached image for this prompt
    if (imageCache[cacheKey]) {
      console.log('Using cached image');
      return imageCache[cacheKey];
    }
    
    // Map image styles to descriptive terms
    const styleDescriptions: Record<string, string> = {
      'Cartoon': 'colorful, whimsical cartoon style with bold outlines and vibrant colors',
      'Watercolor': 'soft watercolor painting style with flowing colors and gentle brush strokes',
      'Pixel Art': 'retro pixel art style with visible pixels and limited color palette',
      'Comic Book': 'comic book style with bold lines, dynamic composition and bright colors',
      'Digital Art': 'modern digital art with vibrant colors, smooth gradients, and clean lines',
      '3D Render': '3D rendered illustration with depth, lighting effects, and polished surfaces'
    };
    
    const styleDescription = styleDescriptions[imageStyle] || styleDescriptions['Cartoon'];
    
    // Create a prompt for image generation
    const prompt = `A children's book illustration showing a scene where a ${character} in a ${setting} with a ${object}. Scene description: ${text}. Style: ${styleDescription}.`;

    // Generate the image using Amazon Bedrock
    // Fall back to direct Stability API if Bedrock fails
    let imageUrl;
    try {
      imageUrl = await generateImageWithBedrockStableDiffusion(prompt);
    } catch (error) {
      console.error('Error with Bedrock, falling back to direct Stability API:', error);
      imageUrl = await generateImageWithStableDiffusion(prompt);
    }
    
    // Cache the result
    imageCache[cacheKey] = imageUrl;
    
    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    return '/placeholder.svg'; // Fallback to placeholder if image generation fails
  }
}

export {
  generateImageForStoryPage,
};

export default {
  generateImageForStoryPage,
}; 