
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useToast } from '@/hooks/use-toast';
import { 
  Quote, 
  Star, 
  Heart,
  Sparkles,
  Shuffle
} from 'lucide-react';

const QuotePage: React.FC = () => {
  const { earnCredits, credits } = useCreditSystem();
  const { toast } = useToast();
  const [currentQuote, setCurrentQuote] = useState(0);

  const inspirationalQuotes = [
    {
      text: "You are braver than you believe, stronger than you seem, and smarter than you think! 🌟",
      author: "Winnie the Pooh"
    },
    {
      text: "Every day is a new adventure waiting to happen! 🚀",
      author: "Adventure Bear"
    },
    {
      text: "Dreams come true when you believe in yourself! ✨",
      author: "Magic Fairy"
    }
  ];

  const handleNewQuote = async () => {
    setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length);
    await earnCredits(1, 'reading inspirational quote');
    toast({
      title: "✨ You're Amazing!",
      description: "You earned a magic star for being awesome!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4 pt-40">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-pink-600 text-transparent bg-clip-text">
            💫 Daily Magic Words! ✨
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Get inspired with magical quotes just for you!
          </p>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <Badge className="bg-yellow-500 text-white px-4 py-2 text-lg">
              ⭐ {credits} Stars
            </Badge>
          </div>
        </motion.div>

        <motion.div
          key={currentQuote}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-xl mb-8">
            <div className="text-center">
              <Quote className="h-16 w-16 mx-auto mb-6 text-purple-600" />
              <blockquote className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 leading-relaxed">
                "{inspirationalQuotes[currentQuote].text}"
              </blockquote>
              <p className="text-lg text-gray-600 mb-6">
                - {inspirationalQuotes[currentQuote].author}
              </p>
              
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={handleNewQuote}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-8 py-4 text-lg rounded-full"
                >
                  <Shuffle className="mr-2 h-5 w-5" />
                  New Magic Words! ✨
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-blue-200">
            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Daily Inspiration</h3>
            <p className="text-gray-600 text-center">Get motivated every day!</p>
          </Card>
          
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-purple-200">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Feel Good</h3>
            <p className="text-gray-600 text-center">Positive vibes only!</p>
          </Card>
          
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-pink-200">
            <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Magic Rewards</h3>
            <p className="text-gray-600 text-center">Earn stars for reading!</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuotePage;
