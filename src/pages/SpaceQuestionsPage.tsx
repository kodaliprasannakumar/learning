import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { 
  Rocket, 
  Star, 
  Planet,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const SpaceQuestionsPage: React.FC = () => {
  const { credits } = useCreditSystem();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Space questions data
  const spaceQuestions = [
    {
      question: "What is the largest planet in our solar system?",
      options: ["Earth", "Jupiter", "Mars", "Venus"],
      correctAnswer: "Jupiter",
      explanation: "Jupiter is the largest planet in our solar system, big enough to fit all the other planets inside!"
    },
    {
      question: "Which planet is known as the 'Red Planet'?",
      options: ["Mars", "Venus", "Mercury", "Saturn"],
      correctAnswer: "Mars",
      explanation: "Mars is known as the 'Red Planet' because of its reddish appearance due to iron oxide on its surface."
    },
    {
      question: "What is the name of our galaxy?",
      options: ["Andromeda", "Triangulum", "Milky Way", "Whirlpool"],
      correctAnswer: "Milky Way",
      explanation: "Our galaxy is called the Milky Way, a spiral galaxy containing billions of stars, planets, and other celestial objects."
    }
  ];

  // Handle answer selection
  const handleAnswer = (selectedAnswer: string) => {
    // Check if the answer is correct
    const isCorrect = selectedAnswer === spaceQuestions[currentQuestion].correctAnswer;

    // Provide feedback to the user
    if (isCorrect) {
      alert("Correct! You're a space expert! 🎉");
    } else {
      alert(`Incorrect. The correct answer is ${spaceQuestions[currentQuestion].correctAnswer}.`);
    }

    // Move to the next question or end the quiz
    if (currentQuestion < spaceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      alert("Quiz completed! Thanks for exploring space with us! 🚀");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4 pt-40">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            🚀 Space Adventure! 🌟
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Explore the universe and learn amazing facts about space!
          </p>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <Badge className="bg-yellow-500 text-black px-4 py-2 text-lg">
              ⭐ {credits} Stars
            </Badge>
          </div>
        </motion.div>

        <Card className="p-8 bg-white/10 backdrop-blur-sm border border-white/20">
          <div className="text-center">
            <Rocket className="h-24 w-24 mx-auto mb-6 text-blue-400" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Space Questions Coming Soon! 🌌
            </h2>
            <p className="text-gray-300 mb-6">
              Get ready to explore galaxies, planets, and stars!
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white px-8 py-4 text-lg rounded-full">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Space Journey
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SpaceQuestionsPage;
