/**
 * AWS Lambda Integration Utilities
 * Provides functions to interact with AWS Lambda API endpoints
 */

const LAMBDA_ENDPOINT = 'https://kxjju6abc5.execute-api.us-west-2.amazonaws.com/default/generate-media';

/**
 * Generate text using OpenAI via AWS Lambda
 * @param prompt The prompt to send to the model
 * @param maxTokens Maximum tokens to generate
 * @returns The generated text response
 */
export async function generateText(prompt: string, maxTokens = 300): Promise<string> {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'text',
        prompt,
        max_tokens: maxTokens
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error || 'Failed to generate text');
    }
    
    return data.response;
  } catch (error) {
    console.error('Text generation error:', error);
    throw error;
  }
}

/**
 * Generate an enhanced image from a doodle
 * @param doodleImage The doodle image URL or data URL
 * @param style The style to apply (cartoon, watercolor, pixel, storybook, sketchy)
 * @returns Object with imageUrl and description
 */
export async function generateImage(
  doodleImage: string, 
  style: 'cartoon' | 'watercolor' | 'pixel' | 'storybook' | 'sketchy' = 'cartoon'
): Promise<{ imageUrl: string; description: string }> {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'image',
        doodleImage,
        style
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error || 'Failed to generate image');
    }
    
    return {
      imageUrl: data.imageUrl,
      description: data.description
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}

/**
 * Generate a video representation from a doodle
 * @param doodleImage The doodle image URL or data URL
 * @param description Optional description to guide video generation
 * @param style The style to apply
 * @returns Object with videoUrl, description and message
 */
export async function generateVideo(
  doodleImage: string,
  description?: string,
  style: 'cartoon' | 'watercolor' | 'pixel' | 'storybook' | 'sketchy' = 'cartoon'
): Promise<{ videoUrl: string; description: string; message?: string }> {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'video',
        doodleImage,
        prompt: description,
        style
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error || 'Failed to generate video');
    }
    
    return {
      videoUrl: data.videoUrl,
      description: data.description,
      message: data.message
    };
  } catch (error) {
    console.error('Video generation error:', error);
    throw error;
  }
}

/**
 * Validate a question or sentence
 * @param sentence The sentence to validate
 * @returns Validation message
 */
export async function validateSentence(sentence: string): Promise<string> {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'text',
        prompt: `Validate if this is a proper, grammatically correct question: "${sentence}". Reply with ONLY "valid" if it's a valid question, or a very brief explanation of why it's not valid (max 15 words) if it's not.`,
        max_tokens: 50
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error || 'Failed to validate sentence');
    }
    
    return data.response;
  } catch (error) {
    console.error('Sentence validation error:', error);
    throw error;
  }
} 