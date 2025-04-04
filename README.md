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

Contributions to improve Botadoodle are welcome. Please feel free to submit a pull request or open an issue.
