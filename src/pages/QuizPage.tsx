import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useToast } from '@/components/ui/use-toast';

// Default quiz URL - will be configurable
const DEFAULT_QUIZ_URL = "https://app.sli.do/event/c6DcANaAEb7AxnxNmDZnKM/live/polls";
const QUIZ_COMPLETION_REWARD = 5;

export default function QuizPage() {
  const [quizUrl, setQuizUrl] = useState(DEFAULT_QUIZ_URL);
  const { earnCredits } = useCreditSystem();
  const { toast: useToastToast } = useToast();
  
  // Function to reward students for quiz completion
  const handleQuizCompletion = async () => {
    // Award credits for quiz completion
    const success = await earnCredits(QUIZ_COMPLETION_REWARD, "Completed quiz");
    if (success) {
      useToastToast({
        title: "Quiz completed! 🎉",
        description: `You earned ${QUIZ_COMPLETION_REWARD} credits for completing the quiz!`,
        variant: "default"
      });
    } else {
      toast.error("There was an issue awarding credits. Please try again.");
    }
  };
  
  // Refresh the quiz iframe
  const refreshQuiz = () => {
    const iframe = document.getElementById('quiz-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
      toast.success("Quiz refreshed!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold py-4 leading-[1.4] bg-gradient-to-r from-kid-blue to-purple-600 text-transparent bg-clip-text">
            Interactive Quiz
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Test your knowledge and earn rewards by completing this interactive quiz!
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-100 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-700">Today's Quiz</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshQuiz}
                className="bg-white hover:bg-blue-50 text-blue-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Quiz
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
              <div className="aspect-video w-full">
                <iframe
                  id="quiz-iframe"
                  src={quizUrl}
                  className="w-full h-full border-0 rounded-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-200 rounded-xl shadow-md">
            <div className="flex items-center mb-4 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-xl font-bold text-amber-700">Quiz Benefits</h2>
            </div>
            <div className="bg-white/50 p-4 rounded-xl border border-amber-100">
              <ul className="space-y-2 text-amber-700">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Complete quizzes to earn {QUIZ_COMPLETION_REWARD} credits
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Test your knowledge on various topics
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Track your progress and compete with classmates
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 