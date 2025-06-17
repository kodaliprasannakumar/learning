import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useAuth } from '@/hooks/useAuth';
import { 
  Palette, 
  Download, 
  Trash2, 
  Sparkles,
  Wand2,
  Star,
  Heart
} from 'lucide-react';

const DoodlePage: React.FC = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { spendCredits, credits } = useCreditSystem();
  const { user } = useAuth();

  const generateMagicArt = async () => {
    if (!user) {
      toast({
        title: "Please sign in first! 🌟",
        description: "You need to join Wizzle to create magic art!",
      });
      return;
    }

    const canSpend = await spendCredits(10, 'magic art creation');
    if (!canSpend) return;

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "🎨 Magic Art Created!",
        description: "Your drawing has been transformed with AI magic!",
      });
    }, 3000);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4 pt-40">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
            🎨 Magic Art Studio! ✨
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Draw something amazing and let AI magic transform it!
          </p>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <Badge className="bg-yellow-500 text-white px-4 py-2 text-lg">
              ⭐ {credits} Stars
            </Badge>
            <Badge className="bg-purple-500 text-white px-4 py-2 text-lg">
              🎨 Magic Art: 10 stars
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drawing Canvas */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
              🖼️ Your Canvas
            </h2>
            <div className="border-4 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="w-full h-auto border-2 border-gray-200 rounded cursor-crosshair bg-white"
                onMouseDown={() => setIsDrawing(true)}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
                onMouseMove={draw}
              />
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                  }
                }}
                className="text-gray-600 hover:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              
              <Button 
                onClick={generateMagicArt}
                disabled={isGenerating || credits < 10}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Creating Magic...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Make It Magic! ✨
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Magic Preview */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
              ✨ Magic Result
            </h2>
            <div className="border-4 border-dashed border-purple-300 rounded-lg p-4 h-80 flex items-center justify-center">
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl"
                >
                  ✨
                </motion.div>
              ) : (
                <div className="text-center text-gray-500">
                  <Star className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                  <p>Your magical artwork will appear here! 🎨</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Color Palette */}
        <Card className="mt-8 p-6 bg-white/90 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-4 text-center">🎨 Magic Colors</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'].map((color) => (
              <motion.div
                key={color}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full cursor-pointer shadow-lg border-4 border-white"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DoodlePage;
