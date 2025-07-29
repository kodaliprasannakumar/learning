/**
 * Progress Tracker - User Achievement and Skill System
 * Displays user progress, achievements, and unlocked features
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Music, 
  Target, 
  Clock, 
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
  Users,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { musicService, type UserMusicProgress, type Achievement } from '@/services/musicService';

interface ProgressTrackerProps {
  onClose: () => void;
}

// Achievement definitions
const ACHIEVEMENT_CATALOG: Achievement[] = [
  {
    id: 'first_song',
    name: 'First Song',
    description: 'Created your very first composition!',
    icon: '🎵',
    category: 'composition'
  },
  {
    id: 'composer',
    name: 'Composer',
    description: 'Created 5 compositions',
    icon: '🎼',
    category: 'composition'
  },
  {
    id: 'music_master',
    name: 'Music Master',
    description: 'Created 25 compositions',
    icon: '🏆',
    category: 'composition'
  },
  {
    id: 'multi_instrumentalist',
    name: 'Multi-Instrumentalist',
    description: 'Unlocked 4 different instruments',
    icon: '🎸',
    category: 'technical'
  },
  {
    id: 'student',
    name: 'Eager Student',
    description: 'Completed 3 music theory lessons',
    icon: '📚',
    category: 'learning'
  },
  {
    id: 'dedicated_musician',
    name: 'Dedicated Musician',
    description: 'Practiced for over 1 hour',
    icon: '⏰',
    category: 'learning'
  },
  {
    id: 'ai_collaborator',
    name: 'AI Collaborator',
    description: 'Used AI assistance 10 times',
    icon: '🤖',
    category: 'technical'
  },
  {
    id: 'rhythm_master',
    name: 'Rhythm Master',
    description: 'Created 10 songs with drum patterns',
    icon: '🥁',
    category: 'technical'
  },
  {
    id: 'melody_maker',
    name: 'Melody Maker',
    description: 'Composed 15 beautiful melodies',
    icon: '🎶',
    category: 'composition'
  },
  {
    id: 'theory_expert',
    name: 'Theory Expert',
    description: 'Completed all music theory lessons',
    icon: '🎓',
    category: 'learning'
  }
];

// Skill level definitions
const SKILL_LEVELS = [
  {
    level: 1,
    name: 'Beginner',
    description: 'Learning the basics of music creation',
    color: 'green',
    compositionsRequired: 0,
    features: ['Basic note placement', 'Simple melodies', 'Piano & drums']
  },
  {
    level: 2,
    name: 'Intermediate',
    description: 'Understanding harmony and rhythm',
    color: 'blue',
    compositionsRequired: 5,
    features: ['Harmony suggestions', 'Rhythm patterns', 'More instruments', 'AI assistance']
  },
  {
    level: 3,
    name: 'Advanced',
    description: 'Creating complex arrangements',
    color: 'purple',
    compositionsRequired: 15,
    features: ['Song structure', 'Multiple tracks', 'Advanced AI', 'Collaboration']
  },
  {
    level: 4,
    name: 'Expert',
    description: 'Master of music composition',
    color: 'gold',
    compositionsRequired: 35,
    features: ['Professional tools', 'Export options', 'Teaching others', 'All instruments']
  }
];

export default function ProgressTracker({ onClose }: ProgressTrackerProps) {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserMusicProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserProgress();
    }
  }, [user?.id]);

  const loadUserProgress = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const progress = await musicService.getUserProgress(user.id);
    setUserProgress(progress);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </Card>
    );
  }

  if (!userProgress) {
    return (
      <Card className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Unable to load progress. Please try again.</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </Card>
    );
  }

  const currentSkillLevel = SKILL_LEVELS.find(level => level.level === userProgress.skillLevel) || SKILL_LEVELS[0];
  const nextSkillLevel = SKILL_LEVELS.find(level => level.level === userProgress.skillLevel + 1);
  
  // Calculate progress to next level
  const currentLevelRequirement = currentSkillLevel.compositionsRequired;
  const nextLevelRequirement = nextSkillLevel?.compositionsRequired || 100;
  const progressToNext = Math.min(100, 
    ((userProgress.totalCompositions - currentLevelRequirement) / 
     (nextLevelRequirement - currentLevelRequirement)) * 100
  );

  // Get earned achievements
  const earnedAchievements = ACHIEVEMENT_CATALOG.filter(achievement => 
    userProgress.achievements.includes(achievement.id)
  );

  // Get available achievements
  const availableAchievements = ACHIEVEMENT_CATALOG.filter(achievement => 
    !userProgress.achievements.includes(achievement.id)
  );

  const categoryIcons = {
    composition: Music,
    learning: BookOpen,
    social: Users,
    technical: Zap
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-700">Your Music Journey</h1>
          <p className="text-purple-600">Track your progress and celebrate achievements</p>
        </div>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>

      {/* Skill Level Progress */}
      <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-50 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-200 rounded-full">
              <Star className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-700">Skill Level: {currentSkillLevel.name}</h2>
              <p className="text-purple-600">{currentSkillLevel.description}</p>
            </div>
          </div>
          
          <Badge 
            variant="secondary" 
            className={`text-lg px-4 py-2 bg-${currentSkillLevel.color}-100 text-${currentSkillLevel.color}-700`}
          >
            Level {userProgress.skillLevel}
          </Badge>
        </div>

        {nextSkillLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextSkillLevel.name}</span>
              <span>{userProgress.totalCompositions}/{nextLevelRequirement} compositions</span>
            </div>
            <Progress value={progressToNext} className="h-3" />
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{userProgress.totalCompositions}</div>
            <div className="text-sm text-purple-600">Compositions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{Math.round(userProgress.practiceTimeMinutes / 60 * 10) / 10}h</div>
            <div className="text-sm text-purple-600">Practice Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{userProgress.achievements.length}</div>
            <div className="text-sm text-purple-600">Achievements</div>
          </div>
        </div>
      </Card>

      {/* Current Level Features */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Your Current Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentSkillLevel.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">{feature}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earned Achievements */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Earned Achievements ({earnedAchievements.length})
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {earnedAchievements.map((achievement) => {
              const IconComponent = categoryIcons[achievement.category];
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800">{achievement.name}</h4>
                    <p className="text-sm text-yellow-700">{achievement.description}</p>
                  </div>
                  <IconComponent className="h-4 w-4 text-yellow-600" />
                </motion.div>
              );
            })}
            
            {earnedAchievements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No achievements yet. Keep creating music!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Available Achievements */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Available Achievements ({availableAchievements.length})
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {availableAchievements.map((achievement) => {
              const IconComponent = categoryIcons[achievement.category];
              return (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-75"
                >
                  <div className="text-2xl grayscale">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-700">{achievement.name}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <IconComponent className="h-4 w-4 text-gray-500" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Unlocked Instruments */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Music className="h-5 w-5 text-purple-500" />
          Unlocked Instruments ({userProgress.unlockedInstruments.length})
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {userProgress.unlockedInstruments.map((instrument) => (
            <div
              key={instrument}
              className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200"
            >
              <div className="text-2xl">
                {instrument === 'piano' ? '🎹' :
                 instrument === 'drums' ? '🥁' :
                 instrument === 'guitar' ? '🎸' :
                 instrument === 'violin' ? '🎻' :
                 instrument === 'trumpet' ? '🎺' :
                 instrument === 'synthesizer' ? '🎛️' : '🎵'}
              </div>
              <span className="text-sm font-medium text-purple-700 capitalize">{instrument}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Your Music Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{userProgress.totalCompositions}</div>
            <div className="text-sm text-blue-700">Total Songs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{userProgress.practiceTimeMinutes}</div>
            <div className="text-sm text-green-700">Minutes Practiced</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{userProgress.achievements.length}</div>
            <div className="text-sm text-purple-700">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">{userProgress.completedLessons.length}</div>
            <div className="text-sm text-amber-700">Lessons Done</div>
          </div>
        </div>
      </Card>
    </div>
  );
} 