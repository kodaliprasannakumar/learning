
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

type Doodle = {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
};

export default function SavedDoodles() {
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchDoodles() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('doodles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDoodles(data || []);
      } catch (error) {
        console.error('Error fetching doodles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDoodles();
  }, [user]);

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
          <div className="aspect-square overflow-hidden">
            <img 
              src={doodle.image_url} 
              alt={doodle.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium mb-1">{doodle.title}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(doodle.created_at).toLocaleDateString()}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
