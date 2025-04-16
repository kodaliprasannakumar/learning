import OpenAI from 'openai';

// Create an OpenAI instance
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: For production, this should be handled server-side
});

// Type definition for story elements
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
// In a production app, you might want to use a more robust caching solution
const imageCache: Record<string, string> = {};

/**
 * Generates an image for a story page
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
    
    // Map image styles to descriptive terms for DALL-E
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

    // Call the OpenAI API to generate an image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    });

    // Get the image URL
    const imageUrl = response.data[0]?.url || '/placeholder.svg';
    
    // Cache the result
    imageCache[cacheKey] = imageUrl;
    
    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    return '/placeholder.svg'; // Fallback to placeholder if image generation fails
  }
}

/**
 * Generates a story based on selected elements
 * @param elements Array of story elements (character, setting, object, storyStyle, imageStyle)
 * @returns Promise that resolves to an array of story pages
 */
export async function generateStory(elements: StoryElement[]): Promise<StoryPage[]> {
  try {
    const character = elements.find(e => e.type === 'character')?.name || 'Hero';
    const setting = elements.find(e => e.type === 'setting')?.name || 'Kingdom';
    const object = elements.find(e => e.type === 'object')?.name || 'Treasure';
    const storyStyle = elements.find(e => e.type === 'storyStyle')?.name || 'Fun';
    const imageStyle = elements.find(e => e.type === 'imageStyle')?.name || 'Cartoon';

    // Map story styles to tone instructions for GPT
    const storyStyleInstructions: Record<string, string> = {
      'Fun': 'Make the story light-hearted and playful. Include fun and silly moments that will make children laugh.',
      'Adventure': 'Make the story exciting and action-packed. Include challenges the characters must overcome and a sense of exploration.',
      'Comedy': 'Make the story humorous with funny situations, misunderstandings, and jokes appropriate for children.',
      'Educational': 'Make the story both entertaining and educational. Include interesting facts or lessons related to the character, setting, or object.',
      'Mystery': 'Make the story intriguing with a simple mystery to solve. Include clues that lead to a satisfying resolution.'
    };
    
    const styleInstruction = storyStyleInstructions[storyStyle] || storyStyleInstructions['Fun'];

    // Create a prompt for the story generation
    const prompt = `Create a short children's story about a ${character} in a ${setting} who discovers a ${object}. 
    ${styleInstruction}
    The story should be engaging and appropriate for kids.
    Structure the story into 3 distinct parts: beginning, middle, and end.
    Each part should be a separate paragraph of 2-3 sentences.`;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a creative children\'s story writer who creates engaging, educational, and age-appropriate stories for kids.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract the story content
    const storyContent = response.choices[0]?.message.content;
    
    if (!storyContent) {
      throw new Error('No story content generated');
    }

    // Split the story into paragraphs
    const paragraphs = storyContent.split('\n\n').filter(p => p.trim().length > 0);
    
    // Create story pages with placeholder images initially
    const storyPages: StoryPage[] = paragraphs.map(text => ({
      text,
      image: '/placeholder.svg', // Use placeholder initially
    }));
    
    // Generate images in parallel for all paragraphs
    const imagePromises = paragraphs.map(text => 
      generateImageForStoryPage(character, setting, object, text, imageStyle)
    );
    
    // Wait for all image generations to complete
    const imageUrls = await Promise.all(imagePromises);
    
    // Update the story pages with the generated images
    storyPages.forEach((page, index) => {
      page.image = imageUrls[index];
    });
    
    return storyPages;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

export default {
  generateStory,
}; 