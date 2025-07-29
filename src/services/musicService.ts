/**
 * Music Service - Phase 2 Enhanced Features
 * Handles AI integration, user progress, achievements, and composition management
 */

import { supabase } from '@/integrations/supabase/client';
import type { Composition, Track, Note } from '@/components/music/MusicStudio';

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'composition' | 'learning' | 'social' | 'technical';
  unlockedAt?: Date;
}

// User progress interface
export interface UserMusicProgress {
  skillLevel: number;
  unlockedInstruments: string[];
  completedLessons: string[];
  achievements: string[];
  totalCompositions: number;
  practiceTimeMinutes: number;
  progressData: Record<string, any>;
}

// Composition metadata
export interface CompositionMetadata {
  id?: string;
  title: string;
  genre?: string;
  difficultyLevel: number;
  isPublic: boolean;
  collaborationEnabled: boolean;
  templateUsed?: string;
  aiAssistanceUsed: boolean;
  description?: string;
  tags?: string[];
}

// AI suggestion types
export interface AISuggestion {
  type: 'melody' | 'harmony' | 'rhythm' | 'structure' | 'theory';
  content: string;
  notes?: Note[];
  confidence: number;
  explanation: string;
}

class MusicService {
  /**
   * Get user's music progress from database
   */
  async getUserProgress(userId: string): Promise<UserMusicProgress | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          music_skill_level,
          unlocked_instruments,
          completed_lessons,
          music_achievements,
          total_compositions,
          practice_time_minutes,
          music_progress_data
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        skillLevel: data.music_skill_level || 1,
        unlockedInstruments: data.unlocked_instruments || ['piano', 'drums'],
        completedLessons: data.completed_lessons || [],
        achievements: data.music_achievements || [],
        totalCompositions: data.total_compositions || 0,
        practiceTimeMinutes: data.practice_time_minutes || 0,
        progressData: data.music_progress_data || {}
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
  }

  /**
   * Update user's music progress
   */
  async updateUserProgress(userId: string, progress: Partial<UserMusicProgress>): Promise<boolean> {
    try {
      const updateData: Record<string, any> = {};
      
      if (progress.skillLevel !== undefined) updateData.music_skill_level = progress.skillLevel;
      if (progress.unlockedInstruments) updateData.unlocked_instruments = progress.unlockedInstruments;
      if (progress.completedLessons) updateData.completed_lessons = progress.completedLessons;
      if (progress.achievements) updateData.music_achievements = progress.achievements;
      if (progress.totalCompositions !== undefined) updateData.total_compositions = progress.totalCompositions;
      if (progress.practiceTimeMinutes !== undefined) updateData.practice_time_minutes = progress.practiceTimeMinutes;
      if (progress.progressData) updateData.music_progress_data = progress.progressData;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user progress:', error);
      return false;
    }
  }

  /**
   * Save composition to database
   */
  async saveComposition(userId: string, composition: Composition, metadata: CompositionMetadata): Promise<string | null> {
    try {
      const compositionData = {
        user_id: userId,
        title: metadata.title,
        composition_data: composition,
        bpm: composition.bpm,
        genre: metadata.genre,
        difficulty_level: metadata.difficultyLevel,
        is_public: metadata.isPublic,
        collaboration_enabled: metadata.collaborationEnabled,
        template_used: metadata.templateUsed,
        ai_assistance_used: metadata.aiAssistanceUsed,
        metadata: {
          description: metadata.description,
          tags: metadata.tags || []
        }
      };

      let result;
      if (metadata.id) {
        // Update existing composition
        result = await supabase
          .from('music_compositions')
          .update(compositionData)
          .eq('id', metadata.id)
          .eq('user_id', userId)
          .select('id')
          .single();
      } else {
        // Create new composition
        result = await supabase
          .from('music_compositions')
          .insert(compositionData)
          .select('id')
          .single();
      }

      if (result.error) throw result.error;

      // Update user's composition count if it's a new composition
      if (!metadata.id) {
        await this.incrementCompositionCount(userId);
      }

      return result.data.id;
    } catch (error) {
      console.error('Error saving composition:', error);
      return null;
    }
  }

  /**
   * Load composition from database
   */
  async loadComposition(compositionId: string): Promise<{ composition: Composition; metadata: CompositionMetadata } | null> {
    try {
      const { data, error } = await supabase
        .from('music_compositions')
        .select('*')
        .eq('id', compositionId)
        .single();

      if (error) throw error;

      return {
        composition: data.composition_data,
        metadata: {
          id: data.id,
          title: data.title,
          genre: data.genre,
          difficultyLevel: data.difficulty_level,
          isPublic: data.is_public,
          collaborationEnabled: data.collaboration_enabled,
          templateUsed: data.template_used,
          aiAssistanceUsed: data.ai_assistance_used,
          description: data.metadata?.description,
          tags: data.metadata?.tags || []
        }
      };
    } catch (error) {
      console.error('Error loading composition:', error);
      return null;
    }
  }

  /**
   * Get user's compositions
   */
  async getUserCompositions(userId: string): Promise<Array<{ id: string; title: string; createdAt: Date; metadata: CompositionMetadata }>> {
    try {
      const { data, error } = await supabase
        .from('music_compositions')
        .select('id, title, created_at, genre, difficulty_level, is_public, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(comp => ({
        id: comp.id,
        title: comp.title,
        createdAt: new Date(comp.created_at),
        metadata: {
          id: comp.id,
          title: comp.title,
          genre: comp.genre,
          difficultyLevel: comp.difficulty_level,
          isPublic: comp.is_public,
          collaborationEnabled: false,
          aiAssistanceUsed: false,
          description: comp.metadata?.description,
          tags: comp.metadata?.tags || []
        }
      }));
    } catch (error) {
      console.error('Error fetching user compositions:', error);
      return [];
    }
  }

  /**
   * Increment user's composition count
   */
  private async incrementCompositionCount(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_composition_count', {
        user_id: userId
      });

      if (error) throw error;
    } catch (error) {
      // If RPC doesn't exist, fall back to manual increment
      const progress = await this.getUserProgress(userId);
      if (progress) {
        await this.updateUserProgress(userId, {
          totalCompositions: progress.totalCompositions + 1
        });
      }
    }
  }

  /**
   * Check and award achievements
   */
  async checkAchievements(userId: string, context: { 
    compositionCreated?: boolean;
    instrumentUnlocked?: string;
    lessonCompleted?: string;
    practiceTime?: number;
  }): Promise<Achievement[]> {
    const progress = await this.getUserProgress(userId);
    if (!progress) return [];

    const newAchievements: Achievement[] = [];
    const currentAchievements = progress.achievements;

    // Composition achievements
    if (context.compositionCreated && progress.totalCompositions === 1 && !currentAchievements.includes('first_song')) {
      newAchievements.push({
        id: 'first_song',
        name: 'First Song',
        description: 'Created your very first composition!',
        icon: '🎵',
        category: 'composition'
      });
    }

    if (progress.totalCompositions >= 5 && !currentAchievements.includes('composer')) {
      newAchievements.push({
        id: 'composer',
        name: 'Composer',
        description: 'Created 5 compositions',
        icon: '🎼',
        category: 'composition'
      });
    }

    if (progress.totalCompositions >= 25 && !currentAchievements.includes('music_master')) {
      newAchievements.push({
        id: 'music_master',
        name: 'Music Master',
        description: 'Created 25 compositions',
        icon: '🏆',
        category: 'composition'
      });
    }

    // Instrument achievements
    if (progress.unlockedInstruments.length >= 4 && !currentAchievements.includes('multi_instrumentalist')) {
      newAchievements.push({
        id: 'multi_instrumentalist',
        name: 'Multi-Instrumentalist',
        description: 'Unlocked 4 different instruments',
        icon: '🎸',
        category: 'technical'
      });
    }

    // Learning achievements
    if (progress.completedLessons.length >= 3 && !currentAchievements.includes('student')) {
      newAchievements.push({
        id: 'student',
        name: 'Eager Student',
        description: 'Completed 3 music theory lessons',
        icon: '📚',
        category: 'learning'
      });
    }

    // Practice achievements
    if (progress.practiceTimeMinutes >= 60 && !currentAchievements.includes('dedicated_musician')) {
      newAchievements.push({
        id: 'dedicated_musician',
        name: 'Dedicated Musician',
        description: 'Practiced for over 1 hour',
        icon: '⏰',
        category: 'learning'
      });
    }

    // Update achievements if any new ones were earned
    if (newAchievements.length > 0) {
      const updatedAchievements = [...currentAchievements, ...newAchievements.map(a => a.id)];
      await this.updateUserProgress(userId, { achievements: updatedAchievements });
    }

    return newAchievements;
  }

  /**
   * Get AI music suggestions using OpenAI
   */
  async getAISuggestion(type: string, composition: Composition, selectedTrack: string, customPrompt?: string): Promise<AISuggestion | null> {
    try {
      // Analyze current composition
      const currentTrack = composition.tracks.find(t => t.id === selectedTrack);
      const analysisContext = {
        bpm: composition.bpm,
        trackCount: composition.tracks.length,
        currentTrackInstrument: currentTrack?.instrument,
        noteCount: currentTrack?.notes.length || 0,
        customPrompt
      };

      // For now, return enhanced mock suggestions (would integrate with OpenAI in production)
      return this.generateMockAISuggestion(type, analysisContext);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      return null;
    }
  }

  /**
   * Generate mock AI suggestions (would be replaced with real OpenAI integration)
   */
  private generateMockAISuggestion(type: string, context: any): AISuggestion {
    const suggestions = {
      rhythm: {
        type: 'rhythm' as const,
        content: `Based on your ${context.bpm} BPM composition, here's a dynamic rhythm pattern that will add energy and drive to your music!`,
        notes: this.generateRhythmPattern(context.bpm),
        confidence: 0.92,
        explanation: `This pattern uses syncopated rhythms that work well at ${context.bpm} BPM. The kick drum provides a solid foundation while the snare adds punch on beats 2 and 4. Hi-hats create momentum with steady eighth note patterns.`
      },
      harmony: {
        type: 'harmony' as const,
        content: `Perfect harmony suggestions for your ${context.currentTrackInstrument} melody! These chord progressions will create emotional depth.`,
        notes: this.generateHarmonyPattern(),
        confidence: 0.88,
        explanation: `These chord progressions follow classic music theory principles. The I-V-vi-IV progression creates a satisfying harmonic journey that listeners love. Each chord supports your melody while adding rich harmonic color.`
      },
      melody: {
        type: 'melody' as const,
        content: `Here are some melodic variations and extensions that will make your tune more memorable and engaging!`,
        notes: this.generateMelodyPattern(),
        confidence: 0.85,
        explanation: `These melodic ideas use stepwise motion and small leaps to create smooth, singable lines. The patterns include call-and-response phrases and motivic development to keep listeners engaged.`
      }
    };

    return suggestions[type as keyof typeof suggestions] || suggestions.rhythm;
  }

  /**
   * Generate rhythm pattern based on BPM
   */
  private generateRhythmPattern(bpm: number): Note[] {
    const pattern: Note[] = [];
    const measureLength = 4; // 4 beats per measure
    
    // Adaptive pattern based on BPM
    if (bpm >= 120) {
      // Faster tempo - energetic pattern
      for (let beat = 0; beat < measureLength; beat += 0.5) {
        if (beat % 1 === 0) {
          // Kick on every beat
          pattern.push({
            id: `kick-${beat}`,
            pitch: 'C',
            octave: 2,
            startTime: beat,
            duration: 0.25,
            velocity: 0.8,
            track: ''
          });
        } else {
          // Hi-hat on off-beats
          pattern.push({
            id: `hihat-${beat}`,
            pitch: 'F#',
            octave: 4,
            startTime: beat,
            duration: 0.125,
            velocity: 0.6,
            track: ''
          });
        }
      }
    } else {
      // Slower tempo - more relaxed pattern
      for (let beat = 0; beat < measureLength; beat++) {
        if (beat % 2 === 0) {
          pattern.push({
            id: `kick-${beat}`,
            pitch: 'C',
            octave: 2,
            startTime: beat,
            duration: 0.5,
            velocity: 0.7,
            track: ''
          });
        }
      }
    }

    return pattern;
  }

  /**
   * Generate harmony pattern
   */
  private generateHarmonyPattern(): Note[] {
    // Simple C major chord progression: C - F - G - C
    return [
      // C major chord
      { id: 'c1', pitch: 'C', octave: 3, startTime: 0, duration: 1, velocity: 0.6, track: '' },
      { id: 'e1', pitch: 'E', octave: 3, startTime: 0, duration: 1, velocity: 0.6, track: '' },
      { id: 'g1', pitch: 'G', octave: 3, startTime: 0, duration: 1, velocity: 0.6, track: '' },
      
      // F major chord
      { id: 'f1', pitch: 'F', octave: 3, startTime: 1, duration: 1, velocity: 0.6, track: '' },
      { id: 'a1', pitch: 'A', octave: 3, startTime: 1, duration: 1, velocity: 0.6, track: '' },
      { id: 'c2', pitch: 'C', octave: 4, startTime: 1, duration: 1, velocity: 0.6, track: '' },
      
      // G major chord
      { id: 'g2', pitch: 'G', octave: 3, startTime: 2, duration: 1, velocity: 0.6, track: '' },
      { id: 'b1', pitch: 'B', octave: 3, startTime: 2, duration: 1, velocity: 0.6, track: '' },
      { id: 'd1', pitch: 'D', octave: 4, startTime: 2, duration: 1, velocity: 0.6, track: '' },
    ];
  }

  /**
   * Generate melody pattern
   */
  private generateMelodyPattern(): Note[] {
    // Simple ascending and descending melody
    const melodyNotes = ['C', 'D', 'E', 'F', 'G', 'F', 'E', 'D'];
    return melodyNotes.map((pitch, index) => ({
      id: `melody-${index}`,
      pitch,
      octave: 4,
      startTime: index * 0.5,
      duration: 0.5,
      velocity: 0.7,
      track: ''
    }));
  }
}

export const musicService = new MusicService(); 