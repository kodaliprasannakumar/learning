import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Types
interface RequestBody {
  imageUrl: string;
  userId: string;
  bucketName?: string;
  imageName?: string;
}

serve(async (req: Request) => {
  try {
    // Set CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Or your specific domain
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Parse request
    const { imageUrl, userId, bucketName = 'doodles', imageName } = await req.json() as RequestBody;

    if (!imageUrl || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: imageUrl and userId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create a Supabase client with the Deno runtime Auth context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    // Generate filename if not provided
    const timestamp = new Date().getTime();
    const fileName = imageName || `${userId}/ai-doodle-${timestamp}.png`;

    // Fetch the image from the external URL
    console.log(`Fetching image from ${imageUrl}`);
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch image: ${imageResponse.statusText}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get image data as ArrayBuffer
    const imageData = await imageResponse.arrayBuffer();

    // Ensure bucket exists
    const { error: bucketError } = await supabase.storage.getBucket(bucketName);
    if (bucketError && bucketError.message.includes('does not exist')) {
      const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
        public: true,
      });
      if (createBucketError) {
        return new Response(
          JSON.stringify({ error: `Failed to create bucket: ${createBucketError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, imageData, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      return new Response(
        JSON.stringify({ error: `Failed to upload: ${error.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        publicUrl: publicUrlData.publicUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error in proxy-image function:', err);
    return new Response(
      JSON.stringify({ error: `Server error: ${err.message}` }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}); 