
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doodleImage, doodleName, mode } = await req.json();

    if (!doodleImage) {
      return new Response(
        JSON.stringify({ error: "No doodle image provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get OpenAI API key from environment variable
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Mode can be "image" or "video"
    if (mode === "image") {
      // Generate realistic image from doodle
      const imagePrompt = `Create a realistic interpretation of this child's drawing. The drawing is of ${doodleName || "an object"}. Keep the main concept but make it look professional and detailed.`;
      
      const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
        })
      });

      const imageData = await imageResponse.json();
      
      if (imageData.error) {
        console.error("OpenAI image generation error:", imageData.error);
        return new Response(
          JSON.stringify({ error: "Failed to generate image", details: imageData.error }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ imageUrl: imageData.data[0].url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (mode === "video") {
      // For demonstration purposes, return a mock video response
      // In a production environment, this would use OpenAI or another service to generate a video
      
      // Create a short text description based on doodle name
      const prompt = `Create a short description for an animated video about ${doodleName || "this drawing"}.`;
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a creative assistant that writes short video descriptions." },
            { role: "user", content: prompt }
          ]
        })
      });
      
      const data = await response.json();
      const description = data.choices[0].message.content;
      
      // In a real implementation, you would use this description with a video generation API
      // For now, we'll just return a placeholder with the description
      return new Response(
        JSON.stringify({ 
          videoUrl: "/placeholder.svg", 
          description: description,
          message: "Video would be generated here with a real video generation API"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Use 'image' or 'video'" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in generate-media function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
