
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Trash2, Eye, FilmIcon } from 'lucide-react';
import { toast } from 'sonner';

type Doodle = {
  id: string;
  title: string;
  image_url: string;
  video_url: string | null;
  created_at: string;
};

export default function SavedDoodles() {
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDoodles = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('doodles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDoodles(data || []);
      console.log("Fetched doodles:", data);
    } catch (error) {
      console.error('Error fetching doodles:', error);
      toast.error("Failed to load your doodles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoodles();
  }, [user]);

  const handleDeleteDoodle = async (id: string, imageUrl: string) => {
    if (!user) return;
    
    try {
      // Extract the filename from the URL
      const imageUrlParts = imageUrl.split('/');
      const imageFilename = imageUrlParts[imageUrlParts.length - 1];
      
      // Delete the image from storage if it's in our bucket
      if (imageUrl.includes('doodles')) {
        const { error: storageError } = await supabase
          .storage
          .from('doodles')
          .remove([`${user.id}/${imageFilename}`]);
          
        if (storageError) console.error("Error deleting image:", storageError);
      }
      
      // Also try to delete the associated video if it exists
      const doodle = doodles.find(d => d.id === id);
      if (doodle?.video_url && doodle.video_url.includes('doodles')) {
        const videoUrlParts = doodle.video_url.split('/');
        const videoFilename = videoUrlParts[videoUrlParts.length - 1];
        
        await supabase
          .storage
          .from('doodles')
          .remove([`${user.id}/${videoFilename}`]);
      }
      
      // Delete the record from the database
      const { error: dbError } = await supabase
        .from('doodles')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      // Update local state
      setDoodles(doodles.filter(doodle => doodle.id !== id));
      toast.success("Doodle deleted successfully");
    } catch (error) {
      console.error('Error deleting doodle:', error);
      toast.error("Failed to delete doodle");
    }
  };

  const handleViewDetails = (doodle: Doodle) => {
    // Show a dialog with more details about the doodle
    if (doodle.video_url) {
      toast.info(`💡 "${doodle.title}" has a video visualization! Click on the doodle to view it.`);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 flex flex-col">
            <Skeleton className="w-full h-40 rounded-md mb-3" />
            <Skeleton className="w-2/3 h-5 mb-2" />
            <Skeleton className="w-1/3 h-4" />
          </Card>
        ))}
      </div>
    );
  }

  if (doodles.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl mb-4">You don't have any saved doodles yet</h3>
        <Link to="/doodle">
          <Button className="bg-kid-blue hover:bg-kid-blue/80 text-white">
            Create Your First Doodle
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {doodles.map((doodle) => (
        <Card key={doodle.id} className="overflow-hidden flex flex-col">
          <div 
            className="aspect-square overflow-hidden relative group cursor-pointer"
            onClick={() => handleViewDetails(doodle)}
          >
            <img 
              src={doodle.image_url} 
              alt={doodle.title} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {doodle.video_url && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FilmIcon className="h-10 w-10 text-white" />
                <span className="text-white font-medium ml-2">Has Video</span>
              </div>
            )}
          </div>
          <div className="p-4 flex justify-between items-start">
            <div>
              <h3 className="font-medium mb-1">{doodle.title}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(doodle.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={() => handleDeleteDoodle(doodle.id, doodle.image_url)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
