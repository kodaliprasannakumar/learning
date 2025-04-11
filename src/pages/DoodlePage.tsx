import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DoodleCanvas from '@/components/DoodleCanvas';
import StyleSelector from '@/components/StyleSelector';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2, Wand2, Brush, ArrowLeft, Save, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

type StyleOption = "realistic" | "cartoon" | "watercolor" | "pixel" | "storybook" | "sketchy";

const DoodlePage = () => {
  const [doodleImage, setDoodleImage] = useState<string | null>(null);
  const [doodleName, setDoodleName] = useState<string>('');
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDescription, setVideoDescription] = useState<string | null>(null);
  const [doodleDescription, setDoodleDescription] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>("cartoon");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDoodleComplete = (imageDataUrl: string, name: string) => {
    setDoodleImage(imageDataUrl);
    setDoodleName(name);
    setAiImage(null);
    setVideoUrl(null);
    setVideoDescription(null);
    
    // Trigger confetti when a doodle is completed
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
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
      
      // Trigger confetti celebration
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
      
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
      // Store the description if it exists in the response
      if (data.description) {
        setDoodleDescription(data.description);
      }
      
      toast.success(`${selectedStyle} image generated successfully!`);
      
      // Trigger sparkle confetti
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0.5, y: 0.7 },
        colors: ['#33C3F0', '#FFDEE2', '#FEF7CD', '#F2FCE2', '#E5DEFF']
      });
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
          style: selectedStyle,
          prompt: doodleDescription
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
      
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF9F1C', '#2EC4B6', '#E71D36', '#FF4E50', '#FC913A']
      });
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
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.div 
        className="text-center mb-6 md:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4 text-kid-blue">Doodle to Image</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Draw anything you can imagine and watch it transform into a magical story!
        </p>
      </motion.div>
      
      {!doodleImage ? (
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="p-4 md:p-6 shadow-lg border-4 bg-kid-blue/10 border-kid-blue/40">
            <DoodleCanvas onDoodleComplete={handleDoodleComplete} />
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className="flex flex-col space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-4 shadow-md border-kid-blue/20 hover:shadow-lg transition-shadow overflow-hidden">
              <div className="text-center mb-3">
                <h2 className="text-xl font-semibold text-foreground">{doodleName || "Your Doodle"}</h2>
              </div>
              
              <div className="rounded-md overflow-hidden border border-muted">
                <img 
                  src={doodleImage} 
                  alt={doodleName || "Your doodle"} 
                  className="w-full h-auto" 
                />
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleNewDoodle}
                  className="flex items-center gap-1"
                >
                  <Brush className="h-4 w-4 mr-1" />
                  New Doodle
                </Button>
                
                <Button 
                  onClick={handleSaveDoodle} 
                  disabled={isSaving}
                  className="flex items-center gap-1 bg-kid-blue hover:bg-kid-blue/90"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save Doodle
                    </>
                  )}
                </Button>
              </div>
            </Card>
            
            <Card className="p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-center mb-2">Transform Your Doodle</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Choose a style and turn your drawing into something amazing!
                </p>
              </div>
              
              <StyleSelector
                selectedStyle={selectedStyle}
                onStyleSelect={setSelectedStyle}
              />
              
              <div className="flex justify-center mt-5">
                <Button
                  onClick={handleGenerateRealisticImage}
                  disabled={isGeneratingImage || !doodleImage}
                  className="bg-gradient-to-r from-kid-purple to-kid-blue text-white hover:opacity-90 transition-opacity"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate {selectedStyle} Image
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
          
          <motion.div 
            className="flex flex-col space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {aiImage && (
              <Card className="p-4 shadow-md border-kid-blue/20 hover:shadow-lg transition-shadow overflow-hidden">
                <div className="text-center mb-3">
                  <h2 className="text-xl font-semibold text-foreground">
                    {selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Version
                  </h2>
                </div>
                
                <div className="rounded-md overflow-hidden border border-muted">
                  <img 
                    src={aiImage} 
                    alt={`AI-generated ${selectedStyle} image`} 
                    className="w-full h-auto" 
                  />
                </div>
                
                {doodleDescription && (
                  <div className="bg-amber-50 p-4 rounded-xl mb-4 border-2 border-amber-200">
                    <h3 className="text-lg font-semibold text-amber-700 mb-2">What I See In Your Doodle:</h3>
                    <p className="text-amber-800">{doodleDescription}</p>
                  </div>
                )}
                
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo || !aiImage}
                    className="bg-gradient-to-r from-kid-pink to-kid-purple text-white hover:opacity-90 transition-opacity"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Story...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Story
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
            
            {videoUrl && (
              <Card className="p-4 shadow-md border-kid-blue/20 hover:shadow-lg transition-shadow">
                <div className="text-center mb-3">
                  <h2 className="text-xl font-semibold text-foreground">Your Story</h2>
                </div>
                
                <div className="rounded-md overflow-hidden border border-muted aspect-video">
                  <iframe
                    src={videoUrl}
                    title="Generated video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                
                {videoDescription && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-md">
                    <p className="text-sm text-muted-foreground">{videoDescription}</p>
                  </div>
                )}
                
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => navigate('/puzzle')}
                    className="bg-gradient-to-r from-kid-yellow to-kid-orange text-foreground hover:opacity-90 transition-opacity"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue to Puzzle
                  </Button>
                </div>
              </Card>
            )}
            
            {!aiImage && !videoUrl && (
              <Card className="p-6 shadow-md border-dashed border-2 border-muted flex flex-col items-center justify-center min-h-[300px] text-center">
                <Wand2 className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Transform Your Doodle</h3>
                <p className="text-muted-foreground max-w-xs">
                  Generate an amazing {selectedStyle} version of your drawing, then create a story from it!
                </p>
              </Card>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DoodlePage;
