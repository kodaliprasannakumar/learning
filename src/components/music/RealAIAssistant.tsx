/**
 * Real AI Assistant - Phase 2 Enhanced AI Integration
 * Provides AI-powered suggestions with user progress tracking and achievements
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Music, 
  Brain, 
  BookOpen, 
  Wand2,
  X,
  Send,
  Lightbulb,
  Volume2,
  Trophy,
  Star,
  Target,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { musicService, type Achievement, type AISuggestion } from '@/services/musicService';
import type { Composition, Note, Track } from './MusicStudio';

interface RealAIAssistantProps {
  composition: Composition;
  selectedTrack: string;
  userCredits: number;
  onAIRequest: (type: string, context: any) => Promise<boolean>;
  onCompositionUpdate: (composition: Composition) => void;
  onClose: () => void;
}

// AI feature configurations with enhanced descriptions
const AI_FEATURES = [
  {
    id: 'melody',
    name: 'Melody Enhancement',
    description: 'Get AI suggestions to improve your melody with better note choices and phrasing',
    icon: Music,
    cost: 2,
    color: 'blue',
    skillLevel: 1
  },
  {
    id: 'harmony',
    name: 'Smart Harmonies',
    description: 'Add chord progressions and harmonies that perfectly complement your melody',
    icon: Sparkles,
    cost: 2,
    color: 'purple',
    skillLevel: 2
  },
  {
    id: 'rhythm',
    name: 'Rhythm Patterns',
    description: 'Dynamic drum patterns and rhythmic elements tailored to your composition',
    icon: Volume2,
    cost: 2,
    color: 'green',
    skillLevel: 1
  },
  {
    id: 'structure',
    name: 'Song Structure',
    description: 'AI will help organize your composition into verses, choruses, and bridges',
    icon: Wand2,
    cost: 3,
    color: 'amber',
    skillLevel: 3
  },
  {
    id: 'theory',
    name: 'Music Theory Tips',
    description: 'Learn about the music theory behind your composition with personalized insights',
    icon: BookOpen,
    cost: 1,
    color: 'indigo',
    skillLevel: 1
  }
];

export default function RealAIAssistant({
  composition,
  selectedTrack,
  userCredits,
  onAIRequest,
  onCompositionUpdate,
  onClose
}: RealAIAssistantProps) {
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<AISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const currentTrack = composition.tracks.find(track => track.id === selectedTrack);

  // Load user progress on mount
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

  // Handle AI feature request with progress tracking
  const handleFeatureRequest = async (featureId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to use AI features');
      return;
    }

    const feature = AI_FEATURES.find(f => f.id === featureId);
    if (!feature) return;

    // Check skill level requirement
    if (userProgress && feature.skillLevel > userProgress.skillLevel) {
      toast.error(`This feature requires skill level ${feature.skillLevel}. Keep composing to unlock it!`);
      return;
    }

    setIsLoading(true);
    setActiveFeature(featureId);

    try {
      const success = await onAIRequest(featureId, {
        composition,
        selectedTrack,
        customPrompt: customPrompt.trim()
      });

      if (success) {
        // Get AI suggestion from music service
        const suggestion = await musicService.getAISuggestion(
          featureId, 
          composition, 
          selectedTrack, 
          customPrompt.trim()
        );

        if (suggestion) {
          setAiResponse(suggestion);
          
          // Track AI usage
          await trackAIUsage(featureId);
          
          toast.success(`✨ ${feature.name} generated!`);
        } else {
          toast.error('Failed to generate AI suggestion');
        }
        
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setActiveFeature(null);
      }
    } catch (error) {
      setIsLoading(false);
      setActiveFeature(null);
      toast.error('Failed to get AI suggestion');
    }
  };

  // Track AI usage for achievements and progress
  const trackAIUsage = async (featureType: string) => {
    if (!user?.id || !userProgress) return;

    // Update practice time (AI usage counts as practice)
    const updatedProgress = {
      ...userProgress,
      practiceTimeMinutes: userProgress.practiceTimeMinutes + 2, // 2 minutes per AI request
      progressData: {
        ...userProgress.progressData,
        aiUsageCount: (userProgress.progressData.aiUsageCount || 0) + 1,
        lastAIFeatureUsed: featureType,
        lastAIUsageDate: new Date().toISOString()
      }
    };

    await musicService.updateUserProgress(user.id, updatedProgress);
    
    // Check for achievements
    const achievements = await musicService.checkAchievements(user.id, {
      practiceTime: updatedProgress.practiceTimeMinutes
    });
    
    if (achievements.length > 0) {
      setNewAchievements(achievements);
      achievements.forEach(achievement => {
        toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`);
      });
    }

    setUserProgress(updatedProgress);
  };

  // Apply AI suggestions to composition
  const handleApplySuggestion = async () => {
    if (!aiResponse || !currentTrack || !user?.id) return;

    if (aiResponse.notes && aiResponse.notes.length > 0) {
      const newNotes: Note[] = aiResponse.notes.map((noteData: Note, index: number) => ({
        ...noteData,
        id: `ai-note-${Date.now()}-${index}`,
        track: selectedTrack
      }));

      const updatedComposition = {
        ...composition,
        tracks: composition.tracks.map(track =>
          track.id === selectedTrack
            ? { ...track, notes: [...track.notes, ...newNotes] }
            : track
        ),
        lastModified: new Date()
      };

      onCompositionUpdate(updatedComposition);
      
      // Track application of AI suggestion
      await trackAIApplication();
      
      toast.success('🎵 AI suggestions applied to your composition!');
    } else {
      toast.success('💡 AI insights provided - use them to improve your music!');
    }

    setAiResponse(null);
    setActiveFeature(null);
  };

  const trackAIApplication = async () => {
    if (!user?.id || !userProgress) return;

    const updatedProgress = {
      ...userProgress,
      progressData: {
        ...userProgress.progressData,
        aiApplicationCount: (userProgress.progressData.aiApplicationCount || 0) + 1
      }
    };

    await musicService.updateUserProgress(user.id, updatedProgress);
    setUserProgress(updatedProgress);
  };

  // Calculate skill progress
  const getSkillProgress = () => {
    if (!userProgress) return { level: 1, progress: 0, nextLevelAt: 5 };
    
    const compositionMilestones = [0, 5, 15, 35, 60]; // Compositions needed for each level
    const currentLevel = userProgress.skillLevel;
    const totalCompositions = userProgress.totalCompositions;
    
    const currentLevelRequirement = compositionMilestones[currentLevel - 1] || 0;
    const nextLevelRequirement = compositionMilestones[currentLevel] || 100;
    
    const progress = Math.min(100, ((totalCompositions - currentLevelRequirement) / (nextLevelRequirement - currentLevelRequirement)) * 100);
    
    return {
      level: currentLevel,
      progress,
      nextLevelAt: nextLevelRequirement
    };
  };

  const skillData = getSkillProgress();

  return (
    <Card className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      {/* Header with User Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-purple-700">AI Music Assistant</h2>
            <p className="text-sm text-purple-600">Get smart suggestions for your composition</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {userProgress && (
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Level {skillData.level}</span>
              </div>
              <Progress value={skillData.progress} className="w-20 h-2" />
              <span className="text-xs text-gray-500">{userProgress.totalCompositions}/{skillData.nextLevelAt}</span>
            </div>
          )}
          
          <Badge variant="outline" className="bg-white">
            💰 {userCredits} credits
          </Badge>
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {newAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Achievement Unlocked!</span>
              <span className="text-yellow-700">{achievement.icon} {achievement.name}</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">{achievement.description}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700 font-medium">AI is analyzing your music...</p>
          <p className="text-sm text-purple-600">Using advanced music theory and pattern recognition</p>
        </div>
      )}

      {/* AI Response */}
      {aiResponse && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4 bg-white border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-purple-700">{aiResponse.type.charAt(0).toUpperCase() + aiResponse.type.slice(1)} Suggestion</h3>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(aiResponse.confidence * 100)}% confidence
                </Badge>
              </div>
              <div className="flex gap-2">
                {aiResponse.notes && aiResponse.notes.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplySuggestion}
                    className="flex items-center gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    Apply to Track
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiResponse(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-gray-700">
                {aiResponse.content}
              </div>
              
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <strong>Theory Explanation:</strong> {aiResponse.explanation}
                  </div>
                </div>
              </div>

              {aiResponse.notes && aiResponse.notes.length > 0 && (
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Music className="h-4 w-4" />
                    <span>✨ This suggestion includes {aiResponse.notes.length} musical notes ready to add to your track</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* AI Features Grid */}
      {!isLoading && !aiResponse && (
        <div className="space-y-4">
          {/* Custom Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-700">
              Ask AI a specific question about your music:
            </label>
            <div className="flex gap-2">
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., How can I make this melody more exciting? What key would work better? How can I add more energy to the chorus?"
                className="flex-1 resize-none h-20"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!customPrompt.trim() || userCredits < 1}
                onClick={() => handleFeatureRequest('theory')}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* AI Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AI_FEATURES.map(feature => {
              const IconComponent = feature.icon;
              const canAfford = userCredits >= feature.cost;
              const hasSkillLevel = !userProgress || feature.skillLevel <= userProgress.skillLevel;
              const isAvailable = canAfford && hasSkillLevel;
              
              const colorClasses = {
                blue: 'from-blue-100 to-cyan-50 border-blue-200',
                green: 'from-green-100 to-emerald-50 border-green-200',
                purple: 'from-purple-100 to-violet-50 border-purple-200',
                amber: 'from-amber-100 to-yellow-50 border-amber-200',
                indigo: 'from-indigo-100 to-blue-50 border-indigo-200'
              };

              return (
                <Card
                  key={feature.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md bg-gradient-to-br ${
                    colorClasses[feature.color as keyof typeof colorClasses]
                  } ${!isAvailable ? 'opacity-50' : ''}`}
                  onClick={() => isAvailable && handleFeatureRequest(feature.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      feature.color === 'blue' ? 'bg-blue-200' :
                      feature.color === 'green' ? 'bg-green-200' :
                      feature.color === 'purple' ? 'bg-purple-200' :
                      feature.color === 'amber' ? 'bg-amber-200' :
                      'bg-indigo-200'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{feature.name}</h4>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            Lv.{feature.skillLevel}
                          </Badge>
                          <Badge 
                            variant={canAfford ? "secondary" : "outline"} 
                            className="text-xs"
                          >
                            {feature.cost}💰
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                      
                      {!hasSkillLevel && (
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <Target className="h-3 w-3" />
                          <span>Unlock at Level {feature.skillLevel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Current Composition Analysis */}
          {currentTrack && (
            <Card className="p-4 bg-white border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-700">Current Composition Analysis</h4>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Instrument:</span>
                  <p className="font-medium capitalize">{currentTrack.instrument}</p>
                </div>
                <div>
                  <span className="text-gray-500">BPM:</span>
                  <p className="font-medium">{composition.bpm}</p>
                </div>
                <div>
                  <span className="text-gray-500">Notes:</span>
                  <p className="font-medium">{currentTrack.notes.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">Tracks:</span>
                  <p className="font-medium">{composition.tracks.length}</p>
                </div>
              </div>
              
              {userProgress && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Total Compositions: {userProgress.totalCompositions}</span>
                    <span>Practice Time: {Math.round(userProgress.practiceTimeMinutes / 60 * 10) / 10}h</span>
                    <span>Achievements: {userProgress.achievements.length}</span>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </Card>
  );
} 