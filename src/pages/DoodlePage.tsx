
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DoodleCanvas from '@/components/DoodleCanvas';
import StyleSelector from '@/components/StyleSelector';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type StyleOption = "realistic" | "cartoon" | "watercolor" | "pixel";

const DoodlePage = () => {
  const [doodleImage, setDoodleImage] = useState<string | null>(null);
  const [doodleName, setDoodleName] = useState<string>('');
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDescription, setVideoDescription] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>("realistic");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDoodleComplete = (imageDataUrl: string, name: string) => {
    setDoodleImage(imageDataUrl);
    setDoodleName(name);
    setAiImage(null);
    setVideoUrl(null);
    setVideoDescription(null);
  };

  const handleSaveDoodle = async () => {
    if (!doodleImage || !user) {
      toast.error("Cannot save doodle. Make sure you're logged in.");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `${user.id}/doodle-${timestamp}.png`;
      
      // Convert the data URL to a file
      const imageBlob = await fetch(doodleImage).then(res => res.blob());
      
      // Create storage bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('doodles');
      if (bucketError && bucketError.message.includes('does not exist')) {
        const { error: createBucketError } = await supabase.storage.createBucket('doodles', {
          public: true,
          fileSizeLimit: 5242880 // 5MB limit
        });
        if (createBucketError) {
          throw createBucketError;
        }
      }
      
      // Upload the image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('doodles')
        .upload(fileName, imageBlob, { contentType: 'image/png', upsert: true });
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('doodles')
        .getPublicUrl(fileName);
      
      const imageUrl = publicUrlData.publicUrl;
      console.log("Image uploaded, public URL:", imageUrl);
      
      let aiImageUrl = null;
      if (aiImage) {
        // Save the AI-generated image if available
        const aiFileName = `${user.id}/ai-doodle-${timestamp}.png`;
        const aiImageBlob = await fetch(aiImage).then(res => res.blob());
        
        const { data: aiUploadData, error: aiUploadError } = await supabase.storage
          .from('doodles')
          .upload(aiFileName, aiImageBlob, { contentType: 'image/png', upsert: true });
        
        if (aiUploadError) {
          console.error("AI image upload error:", aiUploadError);
          // Continue even if AI image upload fails
        } else {
          const { data: aiPublicUrlData } = supabase.storage
            .from('doodles')
            .getPublicUrl(aiFileName);
          
          aiImageUrl = aiPublicUrlData.publicUrl;
        }
      }
      
      // Process videoUrl if it exists and is a full URL
      let processedVideoUrl = videoUrl;
      if (videoUrl && videoUrl.startsWith('http')) {
        try {
          // Fetch the video image and upload it
          const videoBlob = await fetch(videoUrl).then(res => res.blob());
          const videoFileName = `${user.id}/video-doodle-${timestamp}.png`;
          
          const { data: videoUploadData, error: videoUploadError } = await supabase.storage
            .from('doodles')
            .upload(videoFileName, videoBlob, { contentType: 'image/png', upsert: true });
            
          if (!videoUploadError) {
            const { data: videoPublicUrlData } = supabase.storage
              .from('doodles')
              .getPublicUrl(videoFileName);
              
            processedVideoUrl = videoPublicUrlData.publicUrl;
          }
        } catch (videoProcessError) {
          console.error("Error processing video URL:", videoProcessError);
          // Continue with original URL if processing fails
        }
      }
      
      // Save the doodle metadata to the database
      const { data: doodleData, error: insertError } = await supabase
        .from('doodles')
        .insert({
          user_id: user.id,
          image_url: aiImageUrl || imageUrl, // Prefer AI image if available
          video_url: processedVideoUrl,
          title: doodleName || `Doodle ${new Date().toLocaleDateString()}`,
        })
        .select();
      
      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }
      
      console.log("Doodle saved:", doodleData);
      toast.success("Doodle saved successfully!");
      
      // Navigate to home page to see the saved doodle
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      console.error("Error saving doodle:", error);
      toast.error("Failed to save doodle. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateRealisticImage = async () => {
    if (!doodleImage) {
      toast.error("Please complete a doodle first!");
      return;
    }
    
    setIsGeneratingImage(true);
    toast.info(`Generating ${selectedStyle} image from your doodle...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-media', {
        body: {
          doodleImage,
          doodleName,
          mode: 'image',
          style: selectedStyle
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        console.error("Image generation error:", data.error);
        throw new Error(data.error);
      }
      
      setAiImage(data.imageUrl);
      toast.success(`${selectedStyle} image generated successfully!`);
    } catch (error) {
      console.error("Error generating realistic image:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!doodleImage) {
      toast.error("Please complete a doodle first!");
      return;
    }
    
    setIsGeneratingVideo(true);
    toast.info("Generating video based on your doodle...");
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-media', {
        body: {
          doodleImage: aiImage || doodleImage,
          doodleName,
          mode: 'video',
          style: selectedStyle
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        console.error("Video generation error:", data.error);
        throw new Error(data.error);
      }
      
      setVideoUrl(data.videoUrl);
      setVideoDescription(data.description);
      toast.success("Video generated successfully!");
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please try again.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleNewDoodle = () => {
    setDoodleImage(null);
    setDoodleName('');
    setAiImage(null);
    setVideoUrl(null);
    setVideoDescription(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4">Doodle to Video</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Draw anything you can imagine and watch it transform into a stylized image and video!
        </p>
      </div>
      
      <Card className="glass-card p-6 md:p-8 animate-scale-in">
        {!doodleImage ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-center">Create Your Doodle</h2>
            <DoodleCanvas onDoodleComplete={handleDoodleComplete} />
          </>
        ) : !aiImage && !videoUrl ? (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6 text-center">Your Doodle: {doodleName}</h2>
            
            <div className="w-full max-w-md mb-8 rounded-xl overflow-hidden border shadow-md">
              <img 
                src={doodleImage} 
                alt={`Your doodle of ${doodleName}`} 
                className="w-full h-auto"
              />
            </div>
            
            <StyleSelector 
              selectedStyle={selectedStyle}
              onStyleSelect={setSelectedStyle}
            />
            
            <div className="flex gap-4 flex-wrap justify-center mt-6">
              <Button 
                variant="outline" 
                onClick={handleNewDoodle}
                className="btn-bounce"
              >
                New Doodle
              </Button>
              <Button 
                onClick={handleSaveDoodle}
                disabled={isSaving}
                className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Doodle"
                )}
              </Button>
              <Button 
                onClick={handleGenerateRealisticImage}
                disabled={isGeneratingImage}
                className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Generating Image...</span>
                  </>
                ) : (
                  `Generate ${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Image`
                )}
              </Button>
            </div>
          </div>
        ) : !videoUrl ? (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6 text-center">Your AI-Enhanced Image</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
              <div className="rounded-xl overflow-hidden border shadow-md">
                <h3 className="text-center py-2 bg-muted font-medium">Original Doodle</h3>
                <img 
                  src={doodleImage} 
                  alt={`Your doodle of ${doodleName}`} 
                  className="w-full h-auto"
                />
              </div>
              
              <div className="rounded-xl overflow-hidden border shadow-md">
                <h3 className="text-center py-2 bg-muted font-medium">{selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Version</h3>
                <img 
                  src={aiImage} 
                  alt={`AI version of ${doodleName}`} 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            <div className="flex gap-4 flex-wrap justify-center">
              <Button 
                variant="outline" 
                onClick={handleNewDoodle}
                className="btn-bounce"
              >
                New Doodle
              </Button>
              <Button 
                onClick={handleSaveDoodle}
                disabled={isSaving}
                className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Doodle"
                )}
              </Button>
              <Button 
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Generating Video...</span>
                  </>
                ) : (
                  "Generate Video"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6 text-center">Your Video</h2>
            
            <div className="w-full mb-8 rounded-xl overflow-hidden shadow-md border">
              <div className="bg-muted p-4 text-center">
                <h3 className="font-medium mb-2">Video Visualization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {videoDescription || "Your animated video would be based on this scene."}
                </p>
              </div>
              <img 
                src={videoUrl} 
                alt="Generated video scene" 
                className="w-full h-auto"
              />
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={handleNewDoodle}
                className="btn-bounce"
              >
                Create Another
              </Button>
              <Button 
                onClick={handleSaveDoodle}
                disabled={isSaving}
                className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Doodle & Video"
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      <div className="mt-16 bg-muted/30 rounded-xl p-6 md:p-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
        <h2 className="text-2xl font-semibold mb-4 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-kid-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-kid-blue font-bold">1</span>
            </div>
            <h3 className="font-medium mb-2">Draw & Name Your Doodle</h3>
            <p className="text-muted-foreground text-sm">Use our canvas to create and name any doodle you can imagine.</p>
          </div>
          
          <div className="bg-background rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-kid-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-kid-blue font-bold">2</span>
            </div>
            <h3 className="font-medium mb-2">Choose Art Style</h3>
            <p className="text-muted-foreground text-sm">Select from realistic, cartoon, watercolor, or pixel art styles.</p>
          </div>
          
          <div className="bg-background rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-kid-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-kid-blue font-bold">3</span>
            </div>
            <h3 className="font-medium mb-2">Generate Video</h3>
            <p className="text-muted-foreground text-sm">Turn your styled image into an animated video scene.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoodlePage;
