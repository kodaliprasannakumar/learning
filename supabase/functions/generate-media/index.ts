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
    const { doodleImage, doodleName, mode, style = "realistic", prompt, max_tokens = 300 } = await req.json();

    // Get OpenAI API key from environment variable
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Mode: "image", "video", or "text" (for puzzle responses)
    if (mode === "text") {
      // Process text generation for puzzles
      console.log("Generating text response for prompt:", prompt);
      
      const textResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "You are a friendly, educational assistant for children. Provide engaging, age-appropriate responses that are informative but simple to understand. Include fun facts when relevant."
            },
            { role: "user", content: prompt }
          ],
          max_tokens: max_tokens
        })
      });
      
      const textData = await textResponse.json();
      
      if (textData.error) {
        console.error("OpenAI text generation error:", textData.error);
        return new Response(
          JSON.stringify({ error: "Failed to generate text response", details: textData.error }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ response: textData.choices[0].message.content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (mode === "image") {
      // Validate doodle image for image generation
      if (!doodleImage) {
        return new Response(
          JSON.stringify({ error: "No doodle image provided" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Style-specific prompt modifications
      let stylePrompt = "";
      switch(style) {
        case "cartoon":
          stylePrompt = "in a colorful cartoon style with bold outlines and vibrant colors";
          break;
        case "watercolor":
          stylePrompt = "in a soft watercolor style with gentle brushstrokes and blended colors";
          break;
        case "pixel":
          stylePrompt = "as pixel art, with clear blocky pixels and limited color palette";
          break;
        case "storybook":
          stylePrompt = "as a children's storybook illustration with whimsical details and soft colors";
          break;
        case "sketchy":
          stylePrompt = "as a refined pencil sketch with detailed shading and texture";
          break;
        default:
          stylePrompt = "in a realistic detailed style";
      }

      // Generate styled image using the actual doodle as input
      // First, we'll use GPT-4 Vision to understand what the doodle is showing
      console.log("Analyzing doodle image...");
      
      const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { 
              role: "system", 
              content: "You are an assistant that analyzes children's drawings and provides detailed descriptions of what they depict." 
            },
            { 
              role: "user", 
              content: [
                { 
                  type: "text", 
                  text: `Analyze this child's drawing and describe what you see in detail. The child says it's "${doodleName || "a drawing"}"` 
                },
                { 
                  type: "image_url", 
                  image_url: { 
                    url: doodleImage 
                  } 
                }
              ] 
            }
          ],
          max_tokens: 300
        })
      });
      
      const visionData = await visionResponse.json();
      
      if (visionData.error) {
        console.error("OpenAI vision analysis error:", visionData.error);
        return new Response(
          JSON.stringify({ error: "Failed to analyze doodle", details: visionData.error }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      const doodleDescription = visionData.choices[0].message.content;
      console.log("Doodle description:", doodleDescription);
      
      // Now use this description to generate a new image with DALL-E
      const imagePrompt = `Create a high-quality image ${stylePrompt} based exactly on this child's drawing. The drawing shows: "${doodleDescription}". Maintain the key elements, proportions, and character of the child's original drawing but enhance it visually.`;
      
      console.log("Generating image with prompt:", imagePrompt);
      
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
        JSON.stringify({ 
          imageUrl: imageData.data[0].url,
          description: doodleDescription // Return the description so we can show it to the user
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (mode === "video") {
      // Validate doodle image for video generation
      if (!doodleImage && !doodleName) {
        return new Response(
          JSON.stringify({ error: "No doodle image or name provided" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      let description = "";
      
      // If we don't have a description yet, analyze the doodle using Vision API
      if (!prompt) {
        try {
          console.log("Analyzing doodle image for video...");
          
          const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openAiApiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                { 
                  role: "system", 
                  content: "You are an assistant that analyzes children's drawings and provides detailed descriptions of what they depict." 
                },
                { 
                  role: "user", 
                  content: [
                    { 
                      type: "text", 
                      text: `Analyze this child's drawing and describe what you see in detail. The child says it's "${doodleName || "a drawing"}"` 
                    },
                    { 
                      type: "image_url", 
                      image_url: { 
                        url: doodleImage 
                      } 
                    }
                  ] 
                }
              ],
              max_tokens: 300
            })
          });
          
          const visionData = await visionResponse.json();
          
          if (visionData.error) {
            console.error("OpenAI vision analysis error:", visionData.error);
            throw new Error("Failed to analyze doodle");
          }
          
          description = visionData.choices[0].message.content;
          console.log("Doodle analysis for video:", description);
        } catch (analysisError) {
          console.error("Error analyzing doodle:", analysisError);
          // Fall back to using just the name if analysis fails
        }
      } else {
        description = prompt; // Use the provided description if available
      }
      
      // Use OpenAI to create a short description and then generate a video
      const videoPrompt = description ? 
        `Create a short description for a lively, animated 8-second video about this drawing: ${description}. The video should be engaging for children. Focus on movements and actions.` :
        `Create a short description for a lively, animated 8-second video about ${doodleName || "this drawing"}. The video should be engaging for children. Focus on movements and actions.`;
      
      console.log("Generating video description with prompt:", videoPrompt);
      
      const descriptionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a creative assistant that writes short video descriptions for children's content." },
            { role: "user", content: videoPrompt }
          ]
        })
      });
      
      const descData = await descriptionResponse.json();
      if (descData.error) {
        console.error("OpenAI description generation error:", descData.error);
        return new Response(
          JSON.stringify({ error: "Failed to generate video description", details: descData.error }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      const videoDescription = descData.choices[0].message.content;
      console.log("Generated video description:", videoDescription);
      
      // Now use the description to generate a video with the Playground API
      try {
        // Generate a video using DALL-E 3 image as a base
        const videoGenPrompt = `Create a fun, animated video for children about ${doodleName}. ${videoDescription}`;
        
        // For now, since direct video generation API is not available, we'll provide
        // an enhanced image with movement suggestion
        const videoImageResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiApiKey}`
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: `Create a single frame from an animated video that captures movement and action: ${videoGenPrompt}. Make it dynamic and visually suggest motion.`,
            n: 1,
            size: "1024x1024",
          })
        });

        const videoImageData = await videoImageResponse.json();
        
        if (videoImageData.error) {
          throw new Error(`Video image generation failed: ${JSON.stringify(videoImageData.error)}`);
        }
        
        return new Response(
          JSON.stringify({ 
            videoUrl: videoImageData.data[0].url, 
            description: videoDescription,
            message: "Video visualization created. Actual video animation would require additional services."
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (videoError) {
        console.error("Video generation error:", videoError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to generate video", 
            details: videoError.message,
            fallbackDescription: videoDescription
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }
    else {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Use 'image', 'video', or 'text'" }),
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
