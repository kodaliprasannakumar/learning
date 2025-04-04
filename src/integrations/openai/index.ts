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
  type: 'character' | 'setting' | 'object';
  image: string;
}

// Type definition for a story page
interface StoryPage {
  text: string;
  image: string;
}

/**
 * Generates an image for a story page
 * @param character The character in the story
 * @param setting The setting of the story
 * @param object The key object in the story
 * @param text The text content of the page
 * @returns Promise that resolves to an image URL
 */
async function generateImageForStoryPage(
  character: string,
  setting: string,
  object: string,
  text: string
): Promise<string> {
  try {
    // Create a prompt for image generation
    const prompt = `A children's book illustration showing a scene where a ${character} in a ${setting} with a ${object}. Scene description: ${text}. Style: colorful, whimsical, child-friendly illustration, digital art.`;

    // Call the OpenAI API to generate an image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    });

    // Return the generated image URL
    return response.data[0]?.url || '/placeholder.svg';
  } catch (error) {
    console.error('Error generating image:', error);
    return '/placeholder.svg'; // Fallback to placeholder if image generation fails
  }
}

/**
 * Generates a story based on selected elements
 * @param elements Array of story elements (character, setting, object)
 * @returns Promise that resolves to an array of story pages
 */
export async function generateStory(elements: StoryElement[]): Promise<StoryPage[]> {
  try {
    const character = elements.find(e => e.type === 'character')?.name || 'Hero';
    const setting = elements.find(e => e.type === 'setting')?.name || 'Kingdom';
    const object = elements.find(e => e.type === 'object')?.name || 'Treasure';

    // Create a prompt for the story generation
    const prompt = `Create a short children's story about a ${character} in a ${setting} who discovers a ${object}. 
    The story should be educational, engaging, and appropriate for kids.
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
    
    // Create story pages and generate images for each page
    const storyPages: StoryPage[] = [];
    
    for (const text of paragraphs) {
      // Generate an image for this story page
      const imageUrl = await generateImageForStoryPage(character, setting, object, text);
      
      storyPages.push({
        text,
        image: imageUrl,
      });
    }
    
    return storyPages;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

export default {
  generateStory,
}; 