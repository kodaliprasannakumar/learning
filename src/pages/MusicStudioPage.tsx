/**
 * Music Studio Page - Enhanced with Phase 2 Features
 * Comprehensive music creation platform with AI assistance, user progress, and achievements
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Music, 
  Sparkles, 
  Users, 
  Share,
  Play,
  BookOpen,
  Trophy,
  Star,
  Target,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useNavigate } from 'react-router-dom';
import MusicStudio from '@/components/music/MusicStudio';
import ProgressTracker from '@/components/music/ProgressTracker';
import { musicService, type UserMusicProgress } from '@/services/musicService';

// Credit costs for music features
const MUSIC_CREDIT_COSTS = {
  AI_HARMONY_SUGGESTION: 2,
  AI_RHYTHM_SUGGESTION: 2,
  COMPOSITION_COMPLETION: 3,
  COLLABORATION_SESSION: 1,
  EXPORT_TO_FILE: 1,
  UNLOCK_INSTRUMENT: 5,
} as const;

export default function MusicStudioPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { credits, spendCredits, earnCredits } = useCreditSystem();
  
  const [showStudio, setShowStudio] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [userProgress, setUserProgress] = useState<UserMusicProgress | null>(null);
  const [isStudioReady, setIsStudioReady] = useState(false);

  // Load user progress when component mounts
  useEffect(() => {
    if (user?.id) {
      loadUserProgress();
    }
  }, [user?.id]);

  const loadUserProgress = async () => {
    if (!user?.id) return;
    
    const progress = await musicService.getUserProgress(user.id);
    setUserProgress(progress);
  };

  const handleStartStudio = () => {
    setShowStudio(true);
  };

  const handleStudioReady = () => {
    setIsStudioReady(true);
  };

  const handleCompositionChange = (composition: any) => {
    // Update practice time when user creates music
    if (user?.id && userProgress) {
      musicService.updateUserProgress(user.id, {
        practiceTimeMinutes: userProgress.practiceTimeMinutes + 1
      });
    }
  };

  // Get skill level display data
  const getSkillLevelData = () => {
    if (!userProgress) return { level: 1, name: 'Beginner', color: 'green' };
    
    const skillLevels = {
      1: { name: 'Beginner', color: 'green' },
      2: { name: 'Intermediate', color: 'blue' },
      3: { name: 'Advanced', color: 'purple' },
      4: { name: 'Expert', color: 'gold' }
    };
    
    return {
      level: userProgress.skillLevel,
      ...(skillLevels[userProgress.skillLevel as keyof typeof skillLevels] || skillLevels[1])
    };
  };

  const skillData = getSkillLevelData();

  if (showStudio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <div className="container mx-auto p-4">
          {/* Studio Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowStudio(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Studio Home
            </Button>
            
            <div className="flex items-center gap-4">
              {userProgress && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Level {skillData.level} {skillData.name}</span>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowProgress(true)}
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Progress
              </Button>
              
              <Badge variant="outline" className="bg-white">
                💰 {credits} credits
              </Badge>
            </div>
          </div>

          {/* Music Studio Component */}
          <MusicStudio
            onStudioReady={handleStudioReady}
            onSpendCredits={spendCredits}
            userCredits={credits}
            onCompositionChange={handleCompositionChange}
          />
        </div>

        {/* Progress Tracker Modal */}
        <Dialog open={showProgress} onOpenChange={setShowProgress}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <ProgressTracker onClose={() => setShowProgress(false)} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="p-3 bg-purple-200 rounded-full">
              <Music className="h-8 w-8 text-purple-700" />
            </div>
            <h1 className="text-4xl font-bold text-purple-700">Music Maker Studio</h1>
          </motion.div>
          <p className="text-lg text-purple-600 max-w-2xl mx-auto">
            Create amazing music with AI assistance, unlock new instruments, and track your musical journey!
          </p>
        </div>

        {/* User Progress Summary */}
        {userProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <Star className="h-6 w-6 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-700">
                      Level {skillData.level} {skillData.name}
                    </h3>
                    <p className="text-purple-600">
                      {userProgress.totalCompositions} compositions • {userProgress.achievements.length} achievements
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">{Math.round(userProgress.practiceTimeMinutes / 60 * 10) / 10}h</div>
                    <div className="text-sm text-purple-600">Practice Time</div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowProgress(true)}
                    className="flex items-center gap-2"
                  >
                    <Trophy className="h-4 w-4" />
                    View Progress
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Main Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Start Creating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 h-full bg-gradient-to-br from-blue-100 to-cyan-50 border-2 border-blue-200 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-200 rounded-lg group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-blue-700">Start Creating</h3>
              </div>
              
              <p className="text-blue-600 mb-4">
                Jump into the music studio and start composing your next masterpiece with our intuitive interface.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Piano roll interface</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Multiple instruments</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Real-time playback</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handleStartStudio}
              >
                Open Studio
              </Button>
            </Card>
          </motion.div>

          {/* AI Assistant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full bg-gradient-to-br from-purple-100 to-violet-50 border-2 border-purple-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-700" />
                </div>
                <h3 className="text-xl font-bold text-purple-700">AI Music Helper</h3>
              </div>
              
              <p className="text-purple-600 mb-4">
                Get intelligent suggestions for melodies, harmonies, and rhythms. Learn music theory as you create!
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Smart melody suggestions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Harmony assistance</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Music theory lessons</span>
                </div>
              </div>
              
              <Badge className="w-full justify-center bg-purple-100 text-purple-700 hover:bg-purple-200">
                Available in Studio
              </Badge>
            </Card>
          </motion.div>

          {/* Progress & Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              className="p-6 h-full bg-gradient-to-br from-amber-100 to-yellow-50 border-2 border-amber-200 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setShowProgress(true)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <Trophy className="h-6 w-6 text-amber-700" />
                </div>
                <h3 className="text-xl font-bold text-amber-700">Your Journey</h3>
              </div>
              
              <p className="text-amber-600 mb-4">
                Track your musical progress, unlock achievements, and advance through skill levels.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Skill level progression</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Achievement system</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Unlock new features</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                View Progress
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Secondary Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Collaboration (Future Feature) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-100 to-emerald-50 border-2 border-green-200 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-200 rounded-lg">
                  <Users className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-700">Collaborate</h3>
                  <Badge variant="outline" className="text-xs bg-white">Coming Soon</Badge>
                </div>
              </div>
              
              <p className="text-green-600 mb-4">
                Create music together with friends! Share compositions and collaborate in real-time.
              </p>
              
              <Button variant="outline" disabled className="w-full border-green-300 text-green-700">
                Available at Level 3
              </Button>
            </Card>
          </motion.div>

          {/* Share & Export (Future Feature) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-pink-100 to-rose-50 border-2 border-pink-200 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-200 rounded-lg">
                  <Share className="h-6 w-6 text-pink-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-pink-700">Share & Export</h3>
                  <Badge variant="outline" className="text-xs bg-white">Coming Soon</Badge>
                </div>
              </div>
              
              <p className="text-pink-600 mb-4">
                Export your creations and share them with the world! Download as audio files.
              </p>
              
              <Button variant="outline" disabled className="w-full border-pink-300 text-pink-700">
                Available at Level 4
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Quick Tutorial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-700">New to Music Creation?</h3>
                  <p className="text-sm text-gray-600">Learn the basics with our interactive tutorial</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowTutorial(true)}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Start Tutorial
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-700"
          >
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Progress Tracker Modal */}
      <Dialog open={showProgress} onOpenChange={setShowProgress}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <ProgressTracker onClose={() => setShowProgress(false)} />
        </DialogContent>
      </Dialog>

      {/* Tutorial Modal */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-2xl">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">Music Studio Tutorial</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-700 mb-2">🎹 Step 1: Choose Your Instrument</h3>
                <p className="text-blue-600">Start with Piano or Drums - they're unlocked by default!</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-700 mb-2">🎵 Step 2: Place Notes</h3>
                <p className="text-green-600">Click on the piano roll to add notes. Each row is a different pitch!</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-700 mb-2">▶️ Step 3: Play Your Music</h3>
                <p className="text-purple-600">Hit the play button to hear your composition come to life!</p>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-bold text-amber-700 mb-2">✨ Step 4: Use AI Help</h3>
                <p className="text-amber-600">Click "AI Help" for smart suggestions and music theory tips!</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => {
                  setShowTutorial(false);
                  handleStartStudio();
                }}
                className="flex-1"
              >
                Start Creating!
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowTutorial(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 