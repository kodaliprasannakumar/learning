import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DoodleCanvas from '@/components/DoodleCanvas';
import StyleSelector from '@/components/StyleSelector';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2, Wand2, Brush, ArrowLeft, Save, ArrowRight, Sparkles, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { generateImage, generateVideo } from '@/integrations/aws/lambda';
import GenerationAnimation from "@/components/GenerationAnimation";

type StyleOption = "cartoon" | "watercolor" | "pixel" | "storybook" | "sketchy";

const DoodlePage = () => {
  const [doodleImage, setDoodleImage] = useState<string | null>(null);
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
  const { earnCredits, spendCredits, credits } = useCreditSystem();
  const { toast: useToastToast } = useToast();

  // Add credit confirmation state
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  // Add state for redirect preference
  const [shouldRedirectAfterSave, setShouldRedirectAfterSave] = useState<boolean>(() => {
    // Get preference from localStorage, default to true if not set
    return localStorage.getItem('redirectAfterSave') !== 'false';
  });

  // Effect to save page state to prevent refresh issues
  useEffect(() => {
    // Save current page state to localStorage when navigating away
    const savePageState = () => {
      if (doodleImage) {
        sessionStorage.setItem('doodlePageState', JSON.stringify({
          path: window.location.pathname,
          hasActiveDoodle: !!doodleImage
        }));
      }
    };

    // Save state when leaving page
    window.addEventListener('beforeunload', savePageState);
    
    // Restore state if available
    const savedState = sessionStorage.getItem('doodlePageState');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.path === '/doodle' && window.location.pathname === '/doodle') {
        // Already on the correct page, clear the state
        sessionStorage.removeItem('doodlePageState');
      }
    }

    return () => {
      window.removeEventListener('beforeunload', savePageState);
    };
  }, [doodleImage]);

  const handleDoodleComplete = (imageDataUrl: string) => {
    setDoodleImage(imageDataUrl);
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
      
      // Create a unique timestamp for all related files
      const timestamp = Date.now();
      
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
      
      // Upload the original doodle image
      const originalFileName = `${user.id}/original-doodle-${timestamp}.png`;
      const originalImageBlob = await fetch(doodleImage).then(res => res.blob());
      
      const { error: originalUploadError } = await supabase.storage
        .from('doodles')
        .upload(originalFileName, originalImageBlob, { contentType: 'image/png', upsert: true });
      
      if (originalUploadError) {
        console.error("Original doodle upload error:", originalUploadError);
        throw originalUploadError;
      }
      
      // Get the public URL for the original doodle
      const { data: originalPublicUrlData } = supabase.storage
        .from('doodles')
        .getPublicUrl(originalFileName);
      
      const originalImageUrl = originalPublicUrlData.publicUrl;
      console.log("Original doodle uploaded, public URL:", originalImageUrl);
      
      // Upload the AI-generated image if available
      let aiImageUrl = null;
      if (aiImage) {
        try {
          // Use the proxy-image Edge Function to fetch and store the image
          // This avoids CORS issues by having the server fetch the image
          const aiFileName = `${user.id}/ai-doodle-${timestamp}.png`;
          
          // Try to use our edge function first
          try {
            // Call our proxy-image Edge Function
            const proxyResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-image`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
              },
              body: JSON.stringify({
                imageUrl: aiImage,
                userId: user.id,
                imageName: aiFileName
              })
            });
            
            if (proxyResponse.ok) {
              const proxyData = await proxyResponse.json();
              aiImageUrl = proxyData.publicUrl;
              console.log("AI image proxied and stored successfully:", aiImageUrl);
            } else {
              // If proxy fails, fall back to direct URL
              console.warn("Proxy function failed, falling back to direct URL:", await proxyResponse.text());
              aiImageUrl = aiImage;
            }
          } catch (proxyError) {
            // If proxy fails, fall back to direct URL
            console.warn("Proxy function error, falling back to direct URL:", proxyError);
            aiImageUrl = aiImage;
            
            // Attempt direct upload as a fallback
            try {
              const aiImageBlob = await fetch(aiImage).then(res => res.blob());
              
              const { error: aiUploadError } = await supabase.storage
                .from('doodles')
                .upload(aiFileName, aiImageBlob, { contentType: 'image/png', upsert: true });
              
              if (!aiUploadError) {
                const { data: aiPublicUrlData } = supabase.storage
                  .from('doodles')
                  .getPublicUrl(aiFileName);
                
                aiImageUrl = aiPublicUrlData.publicUrl;
                console.log("AI doodle uploaded directly, public URL:", aiImageUrl);
              }
            } catch (directFetchError) {
              console.warn("Could not fetch AI image directly either, using original URL:", directFetchError);
            }
          }
        } catch (aiProcessError) {
          console.error("Error processing AI image:", aiProcessError);
          // If we can't upload the AI image, we'll still save the doodle with just the original image
        }
      }
      
      // Process videoUrl if it exists and is a full URL
      let processedVideoUrl = videoUrl;
      if (videoUrl && videoUrl.startsWith('http')) {
        try {
          // Fetch the video image and upload it
          const videoBlob = await fetch(videoUrl).then(res => res.blob());
          const videoFileName = `${user.id}/video-doodle-${timestamp}.png`;
          
          const { error: videoUploadError } = await supabase.storage
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
      
      // Create a title with the style information if applicable
      const title = aiImage 
        ? `${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Doodle (${new Date().toLocaleDateString()})`
        : `Doodle (${new Date().toLocaleDateString()})`;
      
      // Save the doodle metadata to the database with references to both images
      const { data: doodleData, error: insertError } = await supabase
        .from('doodles')
        .insert({
          user_id: user.id,
          image_url: aiImageUrl || originalImageUrl, // Main display image (prefer AI if available)
          video_url: processedVideoUrl,
          title: title,
          details: {
            original_image_url: originalImageUrl,
            ai_image_url: aiImageUrl,
            style: aiImage ? selectedStyle : null,
            description: doodleDescription
          }
        })
        .select();
      
      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }
      
      console.log("Doodle saved successfully:", doodleData);
      toast.success("Doodle saved successfully!");
      
      // Trigger confetti celebration
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
      
      // Navigate to home page to see the saved doodle only if preference is set
      if (shouldRedirectAfterSave) {
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        toast.success("You can continue working on your doodle or start a new one");
      }
      
      // After successful save, reward credits
      const success = await earnCredits(2, "Saved a doodle");
      if (success) {
        useToastToast({
          title: "Doodle saved successfully!",
          description: "You earned 2 credits for saving your creation!",
          variant: "default",
        });
      } else {
        useToastToast({
          title: "Doodle saved successfully!",
          description: "Your creation has been saved.",
          variant: "default",
        });
      }
      
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
    
    // Check if we have enough credits and deduct them
      if (credits < 3) {
        toast.error(`Not enough credits. You need 3 credits to generate an image. You have ${credits} credits.`);
      return;
    }
    
    // First spend the credits
            const success = await spendCredits(3, "Generate AI image");
    if (!success) {
      toast.error("Transaction failed. Could not process credit transaction.");
      return;
    }
    
    setIsGeneratingImage(true);
    toast.info(`Generating ${selectedStyle} image from your doodle...`);
    
    try {
      // Use the new Lambda integration module
      const result = await generateImage(doodleImage, selectedStyle);
      
      setAiImage(result.imageUrl);
      setDoodleDescription(result.description);
      
      toast.success(`${selectedStyle} image generated successfully!`);
      
      // Trigger sparkle confetti
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0.5, y: 0.7 },
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
      
      // Refund credits on failure
      await earnCredits(5, "Refund for failed image generation");
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
      // Use the new Lambda integration module
      const result = await generateVideo(aiImage || doodleImage, doodleDescription, selectedStyle);
      
      setVideoUrl(result.videoUrl);
      setVideoDescription(result.description);
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
    setAiImage(null);
    setVideoUrl(null);
    setVideoDescription(null);
  };

  // Add a confirmation check before generating
  const handleGenerateClick = () => {
    if (credits < 3) {
      useToastToast({
        title: "Not enough credits",
        description: "You need 3 credits to generate an image. You have " + credits + " credits.",
        variant: "destructive"
      });
      return;
    }
    
    setShowCreditConfirm(true);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-10xl">
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
          className="w-full mx-auto"
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
                <h2 className="text-xl font-semibold text-foreground">Your Doodle</h2>
              </div>
              
              <div className="rounded-md overflow-hidden border border-muted">
                <img 
                  src={doodleImage} 
                  alt="Your doodle" 
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
                  onClick={handleGenerateClick}
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
                
                <div className="rounded-md overflow-hidden border border-muted relative">
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
                  {/* <Button
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
                  </Button> */}
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
              <Card className="p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border-dashed border-2 border-muted flex flex-col items-center justify-center min-h-[320px] text-center relative">
                {isGeneratingImage ? (
                  <GenerationAnimation mode="image" />
                ) : (
                  <>
                    <Wand2 className="h-12 w-12 text-muted-foreground mb-5" />
                    <h3 className="text-xl font-medium text-foreground mb-3">Transform Your Doodle</h3>
                    <p className="text-muted-foreground max-w-xs mx-8">
                      Generate an amazing {selectedStyle} version of your drawing, then create a story from it!
                    </p>
                  </>
                )}
              </Card>
            )}
          </motion.div>
        </div>
      )}

      <AlertDialog open={showCreditConfirm} onOpenChange={setShowCreditConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Image Generation</AlertDialogTitle>
            <AlertDialogDescription>
                                Generating an AI image will cost <span className="font-semibold text-amber-600">3 credits</span>.
              You currently have {credits} credits.
              
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  The AI will transform your doodle into a detailed illustration!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 py-2">
            <input 
              type="checkbox" 
              id="redirectPreference"
              checked={shouldRedirectAfterSave}
              onChange={(e) => {
                setShouldRedirectAfterSave(e.target.checked);
                localStorage.setItem('redirectAfterSave', e.target.checked.toString());
              }}
              className="rounded border-gray-300"
            />
            <label htmlFor="redirectPreference" className="text-sm text-gray-600">
              Redirect to home after saving
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCreditConfirm(false);
                handleGenerateRealisticImage();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Coins className="h-4 w-4 mr-2" />
                                Spend 3 Credits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DoodlePage;
