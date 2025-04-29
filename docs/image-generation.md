# Image Generation in Doodle-to-Fable

This application supports two different image generation providers to give you flexibility and reliability:

1. **OpenAI's DALL-E 3**: High quality image generation with strong text comprehension
2. **Stability AI's Stable Diffusion**: Alternative provider with fewer rate limits

## Why Two Providers?

DALL-E 3 has a rate limit of 5 images per minute across all users of your API key. This means that if multiple users are generating stories simultaneously, you may hit this limit and receive errors.

By implementing Stable Diffusion as an alternative, the app can:
- Gracefully handle rate limit errors
- Support more concurrent users
- Provide an alternative when one service is unavailable

## Setup Instructions

### 1. OpenAI API Key (DALL-E 3)

1. Sign up for an OpenAI account at [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Generate an API key at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Add your API key to your `.env` file:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

### 2. Stability AI API Key (Stable Diffusion)

1. Create an account at [https://platform.stability.ai/](https://platform.stability.ai/)
2. Generate an API key in your account dashboard
3. Add your Stability API key to your `.env` file:
   ```
   VITE_STABILITY_API_KEY=your_stability_api_key_here
   ```

## How It Works

The application includes a smart image generation service that:

1. Automatically selects the best provider based on current conditions
2. Tracks DALL-E rate limits to prevent errors
3. Falls back to the alternative provider when needed
4. Allows users to explicitly choose their preferred provider

### Image Provider Selection

Users can select their preferred image provider in the Story Generator:

- **Auto (Recommended)**: Automatically chooses the best provider
- **DALL-E 3**: Uses OpenAI's DALL-E (may have rate limits)
- **Stable Diffusion**: Uses Stability AI's model (no rate limits)

## Technical Implementation

The system uses:

1. A unified interface in `src/services/imageGeneration.ts`
2. Provider-specific implementations in:
   - `src/integrations/openai/index.ts`
   - `src/integrations/stabilityai/index.ts`
3. In-memory rate limit tracking
4. Automatic fallback mechanisms

## Troubleshooting

If you experience issues with image generation:

1. Check that both API keys are valid and properly set in your `.env` file
2. Verify you haven't exceeded your API usage limits on either platform
3. Try explicitly selecting the alternative provider
4. Check the browser console for specific error messages

For persistent issues, you may need to adjust the rate limit settings in `src/services/imageGeneration.ts`. 