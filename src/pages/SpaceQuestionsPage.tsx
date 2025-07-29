import { useState, useEffect } from 'react';
import SpaceGlobe from '../components/SpaceGlobe';
import MissionLogbook from '../components/MissionLogbook';
import { useAuth } from '../hooks/useAuth';
import { useCreditSystem } from '../hooks/useCreditSystem';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface Question {
  question: string;
  answer: string;
  timestamp: number;
}

const PLANET_MISSIONS = [
  "Why is the Sun so hot?",
  "Why is Mercury the fastest planet?",
  "Why is Venus called Earth's twin?",
  "Why do we have seasons on Earth?",
  "Why is Mars red?",
  "What is Jupiter's Great Red Spot?",
  "What are Saturn's rings made of?",
  "Why does Uranus rotate on its side?",
  "Why is Neptune so windy?",
  "Why isn't Pluto a planet anymore?",
];

const SpaceQuestionsPage = () => {
  const { user } = useAuth();
  const { 
    credits: creditBalance, 
    spendCredits: deductCredits, 
    isLoading
  } = useCreditSystem();
  
  const [history, setHistory] = useState<Question[]>([]);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [flyToTarget, setFlyToTarget] = useState<string | null>(null);
  
  // Load completed missions from localStorage on mount
  useEffect(() => {
    const savedMissions = localStorage.getItem('spaceMissions');
    if (savedMissions) {
      setCompletedMissions(JSON.parse(savedMissions));
    }
  }, []);
  
  // Add console log to debug credit balance
  useEffect(() => {
    console.log("SpaceQuestionsPage credit balance:", creditBalance);
  }, [creditBalance]);
  
  const handleAnswerGenerated = (question: string, answer: string) => {
    // Cost one credit per answer
    const canAfford = creditBalance >= 1;
    
    if (!canAfford) {
      toast.error("You need at least 1 credit to ask a question.");
      return;
    }
    
    // Deduct credit
    deductCredits(1, "Space question: " + question);
    
    // Check if this completes a new mission
    if (PLANET_MISSIONS.includes(question) && !completedMissions.includes(question)) {
      const newCompletedMissions = [...completedMissions, question];
      setCompletedMissions(newCompletedMissions);
      localStorage.setItem('spaceMissions', JSON.stringify(newCompletedMissions));
      
      // Fun visual feedback for completing a mission!
      toast.success("🚀 Mission Complete! You've discovered a new planet fact!");
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
    
    // Save to history
    const newQuestion: Question = {
      question,
      answer,
      timestamp: Date.now()
    };
    
    setHistory(prevHistory => [newQuestion, ...prevHistory]);
  };
  
  const handleFlyTo = (planetName: string) => {
    setFlyToTarget(planetName);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-indigo-600">Space Explorer</h1>
          <p className="text-lg text-gray-600 mb-4">Explore the cosmos and complete missions to fill your logbook!</p>
          <Button onClick={() => setIsLogbookOpen(true)}>
            <Rocket className="mr-2 h-4 w-4" />
            View Explorer Logbook ({completedMissions.length} / {PLANET_MISSIONS.length})
          </Button>
        </div>
        
        <div className="bg-gradient-to-b from-indigo-50 to-violet-100 rounded-xl p-4 shadow-lg mb-8">
          <SpaceGlobe 
            onAnswerGenerated={handleAnswerGenerated} 
            credits={creditBalance || 0} 
            flyToTarget={flyToTarget}
            onFlyToComplete={() => setFlyToTarget(null)}
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
      <MissionLogbook 
        isOpen={isLogbookOpen} 
        onClose={() => setIsLogbookOpen(false)}
        completedMissions={completedMissions}
        allMissions={PLANET_MISSIONS}
        onFlyTo={handleFlyTo}
      />
    </div>
  );
};

export default SpaceQuestionsPage; 