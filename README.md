# Botadoodle

Botadoodle is an interactive application that transforms children's doodles into AI-generated artwork, stories, and videos. It provides a fun and creative experience for kids to explore their imagination.

## Features

- **Doodle Canvas**: Draw and create digital artwork with various brushes and colors
- **Story Generator**: Create unique stories with AI-generated illustrations
- **Puzzle Challenge**: Solve interactive puzzles with AI responses

## OpenAI API Setup

This project uses the OpenAI API for generating stories and images. To set up the API:

1. Sign up for an OpenAI account at [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Generate an API key at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Create a `.env` file in the project root and add your API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Restart the development server if it's already running

> **Note**: Keep your API key secure and never commit it to version control.

## Stability AI Setup

For image generation, this project uses Stability AI's Stable Diffusion models. To set up:

1. Create an account at [https://stability.ai/](https://stability.ai/)
2. Generate an API key from your account dashboard
3. Add the API key to your `.env` file:
   ```
   VITE_STABILITY_API_KEY=your_stability_api_key_here
   ```

## Amazon Bedrock Alternative Setup

As an alternative to direct Stability AI API integration, you can use Stable Diffusion models through Amazon Bedrock:

1. Create an AWS account if you don't have one
2. Enable access to Stability AI models in Amazon Bedrock (console → Amazon Bedrock → Model access)
3. Create IAM credentials with Bedrock access permissions
4. Add AWS credentials to your `.env` file:
   ```
   VITE_AWS_ACCESS_KEY_ID=your_aws_access_key
   VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   VITE_AWS_REGION=us-west-2  # or your preferred region where Stability models are available
   ```
5. Install the AWS SDK:
   ```
   npm install @aws-sdk/client-bedrock-runtime
   ```
6. Modify the `src/integrations/stabilityai/index.ts` file to use the Amazon Bedrock integration by uncommenting the relevant code

> **Note**: Using Amazon Bedrock may incur AWS charges. Check the [Amazon Bedrock pricing page](https://aws.amazon.com/bedrock/pricing/) for details.

## Local Development

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd botadoodle

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server
npm run dev
```

## Technologies

This project is built with:

- Vite
- TypeScript
- React
- React Router
- shadcn-ui components 
- Tailwind CSS
- OpenAI API integration
- Supabase for authentication and storage

## Deployment

You can deploy this project using any static site hosting service:

1. Build the production version:
   ```
   npm run build
   ```

2. Deploy the contents of the `dist` folder to your preferred hosting service (Netlify, Vercel, GitHub Pages, etc.)

## Contributing

Contributions to improve Wizzle are welcome. Please feel free to submit a pull request or open an issue.
