import { useState, useEffect } from 'react';
import SpaceGlobe from '../components/SpaceGlobe';
import { useAuth } from '../hooks/useAuth';
import { useCreditSystem } from '../hooks/useCreditSystem';

interface Question {
  question: string;
  answer: string;
  timestamp: number;
}

const SpaceQuestionsPage = () => {
  const { user } = useAuth();
  const { 
    credits: creditBalance, 
    spendCredits: deductCredits, 
    isLoading
  } = useCreditSystem();
  
  const [history, setHistory] = useState<Question[]>([]);
  
  // Add console log to debug credit balance
  useEffect(() => {
    console.log("SpaceQuestionsPage credit balance:", creditBalance);
  }, [creditBalance]);
  
  const handleAnswerGenerated = (question: string, answer: string) => {
    // Cost one credit per answer
    const canAfford = creditBalance >= 1;
    
    if (!canAfford) {
      // Show a toast or notification
      return;
    }
    
    // Deduct credit
    deductCredits(1, "Space question: " + question);
    
    // Save to history
    const newQuestion: Question = {
      question,
      answer,
      timestamp: Date.now()
    };
    
    setHistory(prevHistory => [newQuestion, ...prevHistory]);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-indigo-600">Space Explorer</h1>
        <p className="text-center text-lg mb-8">Explore the cosmos! Hover over the planets to see questions, and click to get answers from our AI space expert.</p>
        
        <div className="bg-gradient-to-b from-indigo-50 to-violet-100 rounded-xl p-4 shadow-lg mb-8">
          <SpaceGlobe 
            onAnswerGenerated={handleAnswerGenerated} 
            credits={creditBalance || 0} 
          />
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Each question costs 1 credit</p>
            <p className="text-lg font-semibold">Credits remaining: <span className="text-indigo-600">{creditBalance || 0}</span></p>
          </div>
        </div>
        
        {history.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Your Cosmic Journey</h2>
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-indigo-800 mb-2">{item.question}</h3>
                  <p className="text-gray-700 whitespace-pre-line">{item.answer}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceQuestionsPage; 