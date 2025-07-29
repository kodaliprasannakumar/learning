/**
 * Instrument Panel - Track Management and Control Component
 * Provides track selection, volume control, muting, and instrument management
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Piano, 
  Drum, 
  Guitar, 
  Music2, 
  Music,
  Volume2, 
  VolumeX, 
  Plus,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Track } from './MusicStudio';

interface InstrumentPanelProps {
  tracks: Track[];
  selectedTrack: string;
  onTrackSelect: (trackId: string) => void;
  onTrackUpdate: (trackId: string, updates: Partial<Track>) => void;
  onTrackAdd: () => void;
  onTrackRemove: (trackId: string) => void;
  userCredits: number;
  onSpendCredits: (amount: number, description: string) => Promise<boolean>;
}

// Available instruments and their unlock costs
const INSTRUMENT_LIBRARY = [
  { id: 'piano', name: 'Piano', icon: Piano, color: '#3B82F6', unlocked: true, cost: 0 },
  { id: 'drums', name: 'Drums', icon: Drum, color: '#EF4444', unlocked: true, cost: 0 },
  { id: 'guitar', name: 'Guitar', icon: Guitar, color: '#F59E0B', unlocked: false, cost: 5 },
  { id: 'violin', name: 'Violin', icon: Music2, color: '#8B5CF6', unlocked: false, cost: 5 },
  { id: 'trumpet', name: 'Trumpet', icon: Music2, color: '#10B981', unlocked: false, cost: 5 },
  { id: 'synthesizer', name: 'Synth', icon: Music, color: '#EC4899', unlocked: false, cost: 8 }
];

// Track color options
const TRACK_COLORS = [
  '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#10B981', '#EC4899',
  '#6366F1', '#F97316', '#84CC16', '#06B6D4', '#F43F5E', '#A855F7'
];

export default function InstrumentPanel({
  tracks,
  selectedTrack,
  onTrackSelect,
  onTrackUpdate,
  onTrackAdd,
  onTrackRemove,
  userCredits,
  onSpendCredits
}: InstrumentPanelProps) {
  const [unlockedInstruments, setUnlockedInstruments] = useState<string[]>(
    () => JSON.parse(localStorage.getItem('unlockedInstruments') || '["piano", "drums"]')
  );

  // Handle instrument unlock
  const handleUnlockInstrument = async (instrumentId: string) => {
    const instrument = INSTRUMENT_LIBRARY.find(i => i.id === instrumentId);
    if (!instrument || unlockedInstruments.includes(instrumentId)) return;

    const success = await onSpendCredits(instrument.cost, `Unlock ${instrument.name}`);
    if (success) {
      const newUnlocked = [...unlockedInstruments, instrumentId];
      setUnlockedInstruments(newUnlocked);
      localStorage.setItem('unlockedInstruments', JSON.stringify(newUnlocked));
      toast.success(`🎵 ${instrument.name} unlocked!`);
    }
  };

  // Handle track volume change
  const handleVolumeChange = (trackId: string, volume: number[]) => {
    onTrackUpdate(trackId, { volume: volume[0] / 100 });
  };

  // Handle track mute toggle
  const handleMuteToggle = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      onTrackUpdate(trackId, { muted: !track.muted });
    }
  };

  // Handle instrument change
  const handleInstrumentChange = (trackId: string, instrumentId: string) => {
    const instrument = INSTRUMENT_LIBRARY.find(i => i.id === instrumentId);
    if (instrument && unlockedInstruments.includes(instrumentId)) {
      onTrackUpdate(trackId, { 
        instrument: instrumentId,
        color: instrument.color 
      });
      toast.success(`Changed to ${instrument.name}`);
    }
  };

  // Handle track color change
  const handleColorChange = (trackId: string, color: string) => {
    onTrackUpdate(trackId, { color });
  };

  // Add new track
  const handleAddTrack = () => {
    if (tracks.length >= 8) {
      toast.error('Maximum 8 tracks allowed');
      return;
    }

    onTrackAdd();
  };

  // Remove track
  const handleRemoveTrack = (trackId: string) => {
    if (tracks.length <= 1) {
      toast.error('Cannot remove the last track');
      return;
    }
    
    onTrackRemove(trackId);
  };

  return (
    <div className="space-y-4">
      {/* Track Controls */}
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-purple-700">Tracks</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTrack}
            className="flex items-center gap-2"
            disabled={tracks.length >= 8}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {tracks.map(track => {
            const instrument = INSTRUMENT_LIBRARY.find(i => i.id === track.instrument);
            const IconComponent = instrument?.icon || Music;
            const isSelected = track.id === selectedTrack;
            const isUnlocked = unlockedInstruments.includes(track.instrument);

            return (
              <motion.div
                key={track.id}
                layout
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-purple-400 bg-purple-100' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => onTrackSelect(track.id)}
              >
                {/* Track Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: track.color }}
                    />
                    <IconComponent className="h-4 w-4" style={{ color: track.color }} />
                    <span className="font-medium text-sm">{track.name}</span>
                    {!isUnlocked && (
                      <Lock className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMuteToggle(track.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      {track.muted ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </Button>
                    
                    {tracks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTrack(track.id);
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="h-3 w-3 text-gray-500" />
                  <Slider
                    value={[track.volume * 100]}
                    onValueChange={(value) => handleVolumeChange(track.id, value)}
                    max={100}
                    step={1}
                    className="flex-1"
                    disabled={track.muted}
                  />
                  <span className="text-xs text-gray-500 min-w-[3ch]">
                    {Math.round(track.volume * 100)}
                  </span>
                </div>

                {/* Instrument Selection */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-2 border-t border-gray-200"
                  >
                    <div className="text-xs font-medium text-gray-600">Instrument:</div>
                    <div className="grid grid-cols-2 gap-1">
                      {INSTRUMENT_LIBRARY.map(inst => {
                        const InstIcon = inst.icon;
                        const isCurrentInstrument = track.instrument === inst.id;
                        const isInstUnlocked = unlockedInstruments.includes(inst.id);

                        return (
                          <Button
                            key={inst.id}
                            variant={isCurrentInstrument ? "default" : "outline"}
                            size="sm"
                            className="flex items-center gap-1 h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isInstUnlocked) {
                                handleInstrumentChange(track.id, inst.id);
                              } else {
                                handleUnlockInstrument(inst.id);
                              }
                            }}
                            disabled={!isInstUnlocked && userCredits < inst.cost}
                          >
                            <InstIcon className="h-3 w-3" />
                            {inst.name}
                            {!isInstUnlocked && (
                              <Badge variant="secondary" className="ml-1 text-xs px-1">
                                {inst.cost}💰
                              </Badge>
                            )}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-600">Color:</div>
                      <div className="flex flex-wrap gap-1">
                        {TRACK_COLORS.map(color => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded border-2 ${
                              track.color === color ? 'border-gray-600' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleColorChange(track.id, color);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Track Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>{track.notes.length} notes</span>
                  <Badge variant="outline" className="text-xs">
                    {instrument?.name || 'Unknown'}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Instrument Library */}
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
        <h3 className="font-bold text-amber-700 mb-3">Instrument Library</h3>
        
        <div className="space-y-2">
          {INSTRUMENT_LIBRARY.map(instrument => {
            const IconComponent = instrument.icon;
            const isUnlocked = unlockedInstruments.includes(instrument.id);

            return (
              <div
                key={instrument.id}
                className={`flex items-center justify-between p-2 rounded border ${
                  isUnlocked 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComponent 
                    className="h-4 w-4" 
                    style={{ color: instrument.color }} 
                  />
                  <span className="text-sm font-medium">{instrument.name}</span>
                  {isUnlocked ? (
                    <Unlock className="h-3 w-3 text-green-600" />
                  ) : (
                    <Lock className="h-3 w-3 text-gray-400" />
                  )}
                </div>

                {!isUnlocked && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnlockInstrument(instrument.id)}
                    disabled={userCredits < instrument.cost}
                    className="flex items-center gap-1 h-7 text-xs"
                  >
                    Unlock
                    <Badge variant="secondary" className="ml-1 text-xs px-1">
                      {instrument.cost}💰
                    </Badge>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 p-2 bg-amber-100 rounded text-xs text-amber-700">
          💡 Unlock new instruments to expand your musical creativity!
        </div>
      </Card>

      {/* Credit Status */}
      <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-green-700">Your Credits</div>
          <Badge variant="outline" className="bg-white">
            💰 {userCredits}
          </Badge>
        </div>
        <div className="text-xs text-green-600 mt-1">
          Unlock instruments and get AI assistance
        </div>
      </Card>
    </div>
  );
} 