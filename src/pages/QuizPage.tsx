
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Star, 
  Trophy,
  Sparkles,
  Heart
} from 'lucide-react';

const QuizPage: React.FC = () => {
  const { earnCredits, credits } = useCreditSystem();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const handleQuizComplete = async () => {
    await earnCredits(5, 'completing quiz');
    toast({
      title: "🎉 Quiz Complete!",
      description: "You earned 5 magic stars!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-orange-100 p-4 pt-40">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-orange-600 text-transparent bg-clip-text">
            🧠 Super Quiz Challenge! 🏆
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Test your knowledge and earn magic stars!
          </p>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <Badge className="bg-yellow-500 text-white px-4 py-2 text-lg">
              ⭐ {credits} Stars
            </Badge>
            <Badge className="bg-green-500 text-white px-4 py-2 text-lg">
              🏆 Score: {score}
            </Badge>
          </div>
        </motion.div>

        <Card className="p-8 bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-xl">
          <div className="text-center">
            <Brain className="h-24 w-24 mx-auto mb-6 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Quiz Game Coming Soon! 🎯
            </h2>
            <p className="text-gray-600 mb-6">
              Get ready for fun questions about animals, nature, and more!
            </p>
            <Button 
              onClick={handleQuizComplete}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white px-8 py-4 text-lg rounded-full"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Quiz Adventure
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuizPage;
