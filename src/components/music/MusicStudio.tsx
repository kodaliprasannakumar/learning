/**
 * Music Studio - Core Composer Component
 * Provides the main interface for music composition with timeline, instruments, and playback
 */

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  RotateCcw,
  Save,
  Sparkles,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Import music components
import ComposerInterface from './ComposerInterface';
import InstrumentPanel from './InstrumentPanel';
import TimelineGrid from './TimelineGrid';
import MusicAudioEngine from './MusicAudioEngine';
import RealAIAssistant from './RealAIAssistant';
import { musicService } from '@/services/musicService';

// Types for music data
export interface Note {
  id: string;
  pitch: string;
  octave: number;
  startTime: number;
  duration: number;
  velocity: number;
  track: string;
}

export interface Track {
  id: string;
  name: string;
  instrument: string;
  volume: number;
  muted: boolean;
  color: string;
  notes: Note[];
}

export interface Composition {
  id?: string;
  title: string;
  bpm: number;
  tracks: Track[];
  createdAt: Date;
  lastModified: Date;
  userId?: string;
}

interface MusicStudioProps {
  onStudioReady: () => void;
  onSpendCredits: (amount: number, description: string) => Promise<boolean>;
  userCredits: number;
  onCompositionChange: (composition: Composition | null) => void;
}

// Default instruments and tracks
const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track-1',
    name: 'Piano',
    instrument: 'piano',
    volume: 0.8,
    muted: false,
    color: '#3B82F6',
    notes: []
  },
  {
    id: 'track-2',
    name: 'Drums',
    instrument: 'drums',
    volume: 0.7,
    muted: false,
    color: '#EF4444',
    notes: []
  }
];

export default function MusicStudio({ 
  onStudioReady, 
  onSpendCredits, 
  userCredits,
  onCompositionChange 
}: MusicStudioProps) {
  const { user } = useAuth();
  
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [composition, setComposition] = useState<Composition>({
    title: 'My New Song',
    bpm: 120,
    tracks: DEFAULT_TRACKS,
    createdAt: new Date(),
    lastModified: new Date()
  });
  
  const [volume, setVolume] = useState([70]);
  const [selectedTrack, setSelectedTrack] = useState<string>('track-1');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // Audio engine reference
  const audioEngineRef = useRef<any>(null);

  // Initialize audio engine and mark studio as ready
  useEffect(() => {
    const initializeStudio = async () => {
      try {
        setIsLoading(true);
        // Simulate audio engine initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        onStudioReady();
        toast.success('🎵 Audio engine ready!');
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
        toast.error('Failed to initialize audio engine');
        setIsLoading(false);
      }
    };

    initializeStudio();
  }, []); // Remove onStudioReady dependency to prevent re-initialization

  // Update parent when composition changes
  useEffect(() => {
    onCompositionChange(composition);
  }, [composition, onCompositionChange]);

  // Debug: Log track selection changes
  useEffect(() => {
    const currentTrack = composition.tracks.find(t => t.id === selectedTrack);
    console.log('Track selection changed:', {
      selectedTrack,
      trackName: currentTrack?.name,
      trackInstrument: currentTrack?.instrument,
      totalNotes: currentTrack?.notes.length || 0
    });
  }, [selectedTrack, composition.tracks]);

  // Playback controls
  const handlePlay = () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.play();
      setIsPlaying(true);
      toast.success('▶️ Playing composition');
    }
  };

  const handlePause = () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleReset = () => {
    setComposition({
      title: 'My New Song',
      bpm: 120,
      tracks: DEFAULT_TRACKS,
      createdAt: new Date(),
      lastModified: new Date()
    });
    handleStop();
    toast.success('🔄 Composition reset');
  };

  // Track management
  const handleTrackUpdate = (trackId: string, updates: Partial<Track>) => {
    console.log('Updating track:', { trackId, updates });
    setComposition(prev => {
      const updatedTracks = prev.tracks.map(track => 
        track.id === trackId ? { ...track, ...updates } : track
      );
      console.log('Updated tracks:', updatedTracks.map(t => ({ 
        id: t.id, 
        name: t.name, 
        instrument: t.instrument, 
        noteCount: t.notes.length 
      })));
      return {
        ...prev,
        tracks: updatedTracks,
        lastModified: new Date()
      };
    });
  };

  const handleNotesUpdate = (trackId: string, notes: Note[]) => {
    console.log('Updating notes for track:', { trackId, noteCount: notes.length });
    // Ensure notes are properly linked to the correct track
    const updatedNotes = notes.map(note => ({
      ...note,
      track: trackId // Ensure track association is correct
    }));
    console.log('Processed notes:', updatedNotes.map(n => ({ id: n.id, track: n.track, pitch: n.pitch })));
    handleTrackUpdate(trackId, { notes: updatedNotes });
  };

  // Add new track
  const handleAddTrack = () => {
    if (composition.tracks.length >= 8) {
      toast.error('Maximum 8 tracks allowed');
      return;
    }

    const availableColors = ['#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#10B981', '#EC4899', '#6366F1', '#F97316'];
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: `Track ${composition.tracks.length + 1}`,
      instrument: 'piano',
      volume: 0.8,
      muted: false,
      color: availableColors[composition.tracks.length % availableColors.length],
      notes: []
    };

    setComposition(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack],
      lastModified: new Date()
    }));

    // Select the new track
    setSelectedTrack(newTrack.id);
    toast.success(`🎵 ${newTrack.name} added!`);
  };

  // Remove track
  const handleRemoveTrack = (trackId: string) => {
    if (composition.tracks.length <= 1) {
      toast.error('Cannot remove the last track');
      return;
    }

    const trackToRemove = composition.tracks.find(t => t.id === trackId);
    
    setComposition(prev => ({
      ...prev,
      tracks: prev.tracks.filter(track => track.id !== trackId),
      lastModified: new Date()
    }));

    // Select another track if the removed track was selected
    if (selectedTrack === trackId) {
      const remainingTracks = composition.tracks.filter(track => track.id !== trackId);
      if (remainingTracks.length > 0) {
        setSelectedTrack(remainingTracks[0].id);
      }
    }

    toast.success(`🗑️ ${trackToRemove?.name || 'Track'} removed`);
  };

  // AI Assistant
  const handleAIRequest = async (type: string, context: any) => {
    const creditCosts = {
      harmony: 2,
      rhythm: 2,
      completion: 3
    };

    const cost = creditCosts[type as keyof typeof creditCosts] || 2;
    const success = await onSpendCredits(cost, `AI ${type} suggestion`);
    
    if (success) {
      // AI logic will be implemented in AIAssistant component
      return true;
    }
    return false;
  };

  // Save composition
  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Please sign in to save compositions');
      return;
    }

    try {
      const metadata = {
        title: composition.title,
        difficultyLevel: 1, // Basic difficulty for now
        isPublic: false,
        collaborationEnabled: false,
        aiAssistanceUsed: false // Would track this based on AI usage
      };

      const compositionId = await musicService.saveComposition(user.id, composition, metadata);
      
      if (compositionId) {
        toast.success('💾 Composition saved successfully!');
        
        // Update user progress
        const progress = await musicService.getUserProgress(user.id);
        if (progress) {
          // Check for achievements
          const achievements = await musicService.checkAchievements(user.id, {
            compositionCreated: true
          });
          
          if (achievements.length > 0) {
            achievements.forEach(achievement => {
              toast.success(`🏆 Achievement: ${achievement.name}!`);
            });
          }
        }
      } else {
        toast.error('Failed to save composition');
      }
    } catch (error) {
      console.error('Error saving composition:', error);
      toast.error('Failed to save composition');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Music Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Audio Engine (hidden component for audio processing) */}
      <MusicAudioEngine
        ref={audioEngineRef}
        composition={composition}
        isPlaying={isPlaying}
        currentTime={currentTime}
        volume={volume[0]}
        onTimeUpdate={setCurrentTime}
        onPlaybackEnd={() => setIsPlaying(false)}
      />

      {/* Transport Controls */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isPlaying ? handlePause : handlePlay}
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Volume2 className="h-4 w-4 text-gray-600" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="w-24"
              />
              <span className="text-sm text-gray-600 min-w-[3ch]">{volume[0]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {composition.bpm} BPM
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIAssistant(true)}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Help
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Composer Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Instrument Panel */}
        <div className="lg:col-span-1">
          <InstrumentPanel
            tracks={composition.tracks}
            selectedTrack={selectedTrack}
            onTrackSelect={setSelectedTrack}
            onTrackUpdate={handleTrackUpdate}
            onTrackAdd={handleAddTrack}
            onTrackRemove={handleRemoveTrack}
            userCredits={userCredits}
            onSpendCredits={onSpendCredits}
          />
        </div>

        {/* Timeline and Composer */}
        <div className="lg:col-span-3">
          <ComposerInterface
            composition={composition}
            selectedTrack={selectedTrack}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onNotesUpdate={handleNotesUpdate}
            onCompositionUpdate={setComposition}
          />
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {showAIAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAIAssistant(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full mx-4"
            >
              <RealAIAssistant
                composition={composition}
                selectedTrack={selectedTrack}
                userCredits={userCredits}
                onAIRequest={handleAIRequest}
                onCompositionUpdate={setComposition}
                onClose={() => setShowAIAssistant(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 