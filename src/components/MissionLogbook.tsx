import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Telescope, Send } from "lucide-react";

interface MissionLogbookProps {
  isOpen: boolean;
  onClose: () => void;
  completedMissions: string[];
  allMissions: string[];
  onFlyTo: (planetName: string) => void;
}

// Mapping questions to planet names and images
const missionDetails: { [key: string]: { name: string, image: string } } = {
  "Why is the Sun so hot?": { name: "Sun", image: "/images/sun.png" },
  "Why is Mercury the fastest planet?": { name: "Mercury", image: "/images/mercury.png" },
  "Why is Venus called Earth's twin?": { name: "Venus", image: "/images/venus.png" },
  "Why do we have seasons on Earth?": { name: "Earth", image: "/images/earth.png" },
  "Why is Mars red?": { name: "Mars", image: "/images/mars.png" },
  "What is Jupiter's Great Red Spot?": { name: "Jupiter", image: "/images/jupiter.png" },
  "What are Saturn's rings made of?": { name: "Saturn", image: "/images/saturn.png" },
  "Why does Uranus rotate on its side?": { name: "Uranus", image: "/images/uranus.png" },
  "Why is Neptune so windy?": { name: "Neptune", image: "/images/neptune.png" },
  "Why isn't Pluto a planet anymore?": { name: "Pluto", image: "/images/pluto.png" },
};

const MissionLogbook: React.FC<MissionLogbookProps> = ({ isOpen, onClose, completedMissions, allMissions, onFlyTo }) => {
  const progressPercentage = (completedMissions.length / allMissions.length) * 100;

  const handleFlyToClick = (planetName: string) => {
    onFlyTo(planetName);
    onClose(); // Close the modal after clicking
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-2">Explorer Logbook</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Track your journey through the solar system. Complete missions to unlock all the planet badges!
          </DialogDescription>
        </DialogHeader>
        <div className="my-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Mission Progress</span>
            <span className="font-bold">{completedMissions.length} / {allMissions.length}</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {allMissions.map((mission, index) => {
            const details = missionDetails[mission];
            const isCompleted = completedMissions.includes(mission);
            return (
              <div 
                key={index} 
                className={`p-4 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-300 ${
                  isCompleted ? 'bg-green-100 border-2 border-green-300 shadow-lg' : 'bg-gray-200'
                }`}
              >
                <img 
                  src={details.image} 
                  alt={details.name} 
                  className={`w-20 h-20 mb-2 transition-all duration-500 ${!isCompleted && 'grayscale opacity-60'}`} 
                />
                <h3 className="font-bold text-lg">{details.name}</h3>
                {isCompleted ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-semibold">Discovered</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Telescope className="h-4 w-4" />
                    <span className="text-sm">Undiscovered</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-indigo-600 hover:bg-indigo-100 h-8"
                  onClick={() => handleFlyToClick(details.name)}
                >
                  <Send className="mr-1.5 h-3 w-3" />
                  Fly To
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MissionLogbook; 