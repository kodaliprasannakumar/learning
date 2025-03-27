
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DoodleCanvas from '@/components/DoodleCanvas';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const DoodlePage = () => {
  const [doodleImage, setDoodleImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDoodleComplete = (imageDataUrl: string) => {
    setDoodleImage(imageDataUrl);
    setVideoUrl(null);
  };

  const handleSaveDoodle = async () => {
    if (!doodleImage || !user) {
      toast.error("Cannot save doodle. Make sure you're logged in.");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Upload the doodle image to Supabase Storage
      const fileName = `doodle-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('doodles')
        .upload(fileName, 
          // Convert the data URL to a file
          await fetch(doodleImage).then(res => res.blob()), 
          { contentType: 'image/png', upsert: true }
        );
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('doodles')
        .getPublicUrl(fileName);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // Save the doodle metadata to the database
      const { error: insertError } = await supabase
        .from('doodles')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          title: `Doodle ${new Date().toLocaleString()}`,
        });
      
      if (insertError) throw insertError;
      
      toast.success("Doodle saved successfully!");
    } catch (error) {
      console.error("Error saving doodle:", error);
      toast.error("Failed to save doodle. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateVideo = () => {
    if (!doodleImage) {
      toast.error("Please complete a doodle first!");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate video generation (in a real app, this would call an API)
    setTimeout(() => {
      // For demo purposes, we'll just use a placeholder
      setIsGenerating(false);
      toast.success("Video generated successfully!");
      
      // Set a placeholder video URL - no API key needed
      setVideoUrl("/placeholder.svg");
    }, 2000);
  };

  const handleNewDoodle = () => {
    setDoodleImage(null);
    setVideoUrl(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4">Doodle to Video</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Draw anything you can imagine and watch it transform into a short animated video!
        </p>
      </div>
      
      <Card className="glass-card p-6 md:p-8 animate-scale-in">
        {!doodleImage ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-center">Create Your Doodle</h2>
            <DoodleCanvas onDoodleComplete={handleDoodleComplete} />
          </>
        ) : !videoUrl ? (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6 text-center">Your Doodle</h2>
            
            <div className="w-full max-w-md mb-8 rounded-xl overflow-hidden border shadow-md">
              <img 
                src={doodleImage} 
                alt="Your doodle" 
                className="w-full h-auto"
              />
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
                    <span className="mr-2">Saving...</span>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  </>
                ) : (
                  "Save Doodle"
                )}
              </Button>
              <Button 
                onClick={handleGenerateVideo}
                disabled={isGenerating}
                className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce"
              >
                {isGenerating ? (
                  <>
                    <span className="mr-2">Generating...</span>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
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
            
            <div className="w-full mb-8 rounded-xl overflow-hidden shadow-md border aspect-video bg-muted flex items-center justify-center">
              {/* In a real app, this would be the video player */}
              <div className="text-center p-10">
                <p className="text-muted-foreground mb-4">
                  [Your animation would play here in a production app]
                </p>
                <img 
                  src={videoUrl} 
                  alt="Generated video placeholder" 
                  className="max-w-full h-auto mx-auto"
                />
              </div>
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
                className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce"
                onClick={() => toast.success("Video downloaded successfully!")}
              >
                Download Video
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
            <h3 className="font-medium mb-2">Draw Your Doodle</h3>
            <p className="text-muted-foreground text-sm">Use our canvas to create any doodle you can imagine.</p>
          </div>
          
          <div className="bg-background rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-kid-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-kid-blue font-bold">2</span>
            </div>
            <h3 className="font-medium mb-2">AI Transformation</h3>
            <p className="text-muted-foreground text-sm">Our AI processes your drawing and brings it to life.</p>
          </div>
          
          <div className="bg-background rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-kid-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-kid-blue font-bold">3</span>
            </div>
            <h3 className="font-medium mb-2">Watch & Share</h3>
            <p className="text-muted-foreground text-sm">View your animation and share it with friends and family.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoodlePage;
