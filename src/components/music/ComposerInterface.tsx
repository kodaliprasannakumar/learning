/**
 * Composer Interface - Timeline and Note Placement Component
 * Provides the main interface for placing and editing musical notes on a timeline
 */

import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ZoomIn, ZoomOut, Grid, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Composition, Track, Note } from './MusicStudio';

interface ComposerInterfaceProps {
  composition: Composition;
  selectedTrack: string;
  currentTime: number;
  isPlaying: boolean;
  onNotesUpdate: (trackId: string, notes: Note[]) => void;
  onCompositionUpdate: (composition: Composition) => void;
}

// Timeline configuration
const MEASURES = 16;
const BEATS_PER_MEASURE = 4;
const SUBDIVISIONS = 4; // 16th notes
const TOTAL_BEATS = MEASURES * BEATS_PER_MEASURE;
const TOTAL_SUBDIVISIONS = TOTAL_BEATS * SUBDIVISIONS;

// Piano roll configuration
const PIANO_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [2, 3, 4, 5, 6];
const ALL_NOTES = OCTAVES.flatMap(octave => 
  PIANO_KEYS.map(key => ({ key, octave, noteValue: `${key}${octave}` }))
).reverse();

export default function ComposerInterface({
  composition,
  selectedTrack,
  currentTime,
  isPlaying,
  onNotesUpdate,
  onCompositionUpdate
}: ComposerInterfaceProps) {
  const [zoom, setZoom] = useState([1]);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const currentTrack = composition.tracks.find(track => track.id === selectedTrack);
  
  // Calculate grid dimensions
  const cellWidth = Math.max(20, 40 * zoom[0]);
  const cellHeight = 20;
  const timelineWidth = TOTAL_SUBDIVISIONS * cellWidth;
  const pianoHeight = ALL_NOTES.length * cellHeight;

  // Convert time to grid position
  const timeToPosition = useCallback((time: number) => {
    const subdivision = (time / 60 * composition.bpm * SUBDIVISIONS);
    return subdivision * cellWidth;
  }, [composition.bpm, cellWidth]);

  // Convert grid position to time
  const positionToTime = useCallback((position: number) => {
    const subdivision = position / cellWidth;
    return (subdivision / SUBDIVISIONS) * (60 / composition.bpm);
  }, [composition.bpm, cellWidth]);

  // Convert note value to grid row
  const noteToRow = useCallback((noteValue: string) => {
    return ALL_NOTES.findIndex(note => note.noteValue === noteValue);
  }, []);

  // Convert grid row to note value
  const rowToNote = useCallback((row: number) => {
    return ALL_NOTES[row]?.noteValue || 'C4';
  }, []);

  // Handle timeline click to add/remove notes
  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!currentTrack || isPlaying) return;

    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate grid position
    const gridX = Math.floor(x / cellWidth);
    const gridY = Math.floor(y / cellHeight);
    
    if (gridY < 0 || gridY >= ALL_NOTES.length) return;
    
    const startTime = positionToTime(gridX * cellWidth);
    const noteValue = rowToNote(gridY);
    const pitch = noteValue.slice(0, -1);
    const octave = parseInt(noteValue.slice(-1));
    
    // Check if there's already a note at this position ON THE SELECTED TRACK
    const existingNoteIndex = currentTrack.notes.findIndex(note => 
      Math.abs(note.startTime - startTime) < 0.1 && 
      note.pitch === pitch && 
      note.octave === octave
    );
    
    if (existingNoteIndex >= 0) {
      // Remove existing note from selected track
      const newNotes = currentTrack.notes.filter((_, index) => index !== existingNoteIndex);
      onNotesUpdate(selectedTrack, newNotes);
    } else {
      // Add new note to selected track
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random()}`,
        pitch,
        octave,
        startTime,
        duration: 0.25, // Quarter note default
        velocity: 0.8,
        track: selectedTrack
      };
      
      onNotesUpdate(selectedTrack, [...currentTrack.notes, newNote]);
    }
  };

  // Handle note selection
  const handleNoteClick = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Only allow selecting notes from the current track
    const noteTrack = composition.tracks.find(track => 
      track.notes.some(note => note.id === noteId)
    );
    
    if (noteTrack?.id !== selectedTrack) {
      // If clicking on a note from a different track, switch to that track
      // But don't select the note yet
      return;
    }
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedNotes(prev => 
        prev.includes(noteId) 
          ? prev.filter(id => id !== noteId)
          : [...prev, noteId]
      );
    } else {
      // Single select
      setSelectedNotes([noteId]);
    }
  };

  // Handle note deletion
  const handleDeleteSelected = () => {
    if (!currentTrack || selectedNotes.length === 0) return;
    
    // Only delete notes from the selected track
    const newNotes = currentTrack.notes.filter(note => !selectedNotes.includes(note.id));
    onNotesUpdate(selectedTrack, newNotes);
    setSelectedNotes([]);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      handleDeleteSelected();
    }
    if (event.key === 'Escape') {
      setSelectedNotes([]);
    }
  };

  // Clear selection when clicking empty area
  const handleTimelineMouseDown = (event: React.MouseEvent) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on a note from ANY track
    const clickedNote = composition.tracks
      .flatMap(track => track.notes)
      .find(note => {
        const noteX = timeToPosition(note.startTime);
        const noteY = noteToRow(`${note.pitch}${note.octave}`) * cellHeight;
        const noteWidth = timeToPosition(note.duration);
        
        return x >= noteX && x <= noteX + noteWidth && 
               y >= noteY && y <= noteY + cellHeight;
      });

    if (!clickedNote) {
      setSelectedNotes([]);
      handleTimelineClick(event);
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Zoom:</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom([Math.max(0.25, zoom[0] - 0.25)])}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={0.25}
                max={3}
                step={0.25}
                className="w-24"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom([Math.min(3, zoom[0] + 0.25)])}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[3ch]">{zoom[0]}x</span>
            </div>

            <Button
              variant={snapToGrid ? "default" : "outline"}
              size="sm"
              onClick={() => setSnapToGrid(!snapToGrid)}
              className="flex items-center gap-2"
            >
              <Grid className="h-4 w-4" />
              Snap to Grid
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={composition.title}
              onChange={(e) => onCompositionUpdate({
                ...composition,
                title: e.target.value,
                lastModified: new Date()
              })}
              placeholder="Song Title"
              className="w-40 text-sm"
            />
            
            <Badge variant={currentTrack ? "default" : "secondary"} className="text-sm">
              Track: {currentTrack?.name || 'None'}
            </Badge>
          </div>
        </div>

        {selectedNotes.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-blue-100 rounded border">
            <Edit className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              {selectedNotes.length} note{selectedNotes.length > 1 ? 's' : ''} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="ml-auto"
            >
              Delete
            </Button>
          </div>
        )}
      </Card>

      {/* Timeline Grid */}
      <Card className="p-4 bg-white border border-gray-200">
        <div className="overflow-auto border border-gray-300 rounded" style={{ maxHeight: '400px' }}>
          <div className="relative" style={{ width: timelineWidth + 100, height: pianoHeight + 50 }}>
            {/* Piano Roll Labels */}
            <div className="absolute left-0 top-0 w-16 bg-gray-100 border-r border-gray-300" style={{ height: pianoHeight }}>
              {ALL_NOTES.map((note, index) => (
                <div
                  key={`${note.key}${note.octave}`}
                  className={`flex items-center justify-center text-xs border-b border-gray-200 ${
                    note.key.includes('#') ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'
                  }`}
                  style={{ height: cellHeight }}
                >
                  {note.noteValue}
                </div>
              ))}
            </div>

            {/* Timeline Header */}
            <div className="absolute top-0 bg-gray-100 border-b border-gray-300" style={{ left: 64, width: timelineWidth, height: 30 }}>
              {Array.from({ length: MEASURES }, (_, measure) => (
                <div key={measure} className="absolute border-r border-gray-400" style={{ left: measure * BEATS_PER_MEASURE * SUBDIVISIONS * cellWidth, height: 30 }}>
                  <span className="text-xs text-gray-600 ml-1">{measure + 1}</span>
                </div>
              ))}
            </div>

            {/* Timeline Grid */}
            <div
              ref={timelineRef}
              className="absolute cursor-crosshair"
              style={{ left: 64, top: 30, width: timelineWidth, height: pianoHeight }}
              onMouseDown={handleTimelineMouseDown}
            >
              {/* Grid Lines */}
              <svg className="absolute inset-0 pointer-events-none" width={timelineWidth} height={pianoHeight}>
                {/* Vertical grid lines */}
                {Array.from({ length: TOTAL_SUBDIVISIONS + 1 }, (_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={i * cellWidth}
                    y1={0}
                    x2={i * cellWidth}
                    y2={pianoHeight}
                    stroke={i % (SUBDIVISIONS * BEATS_PER_MEASURE) === 0 ? '#666' : i % SUBDIVISIONS === 0 ? '#999' : '#ddd'}
                    strokeWidth={i % (SUBDIVISIONS * BEATS_PER_MEASURE) === 0 ? 2 : 1}
                  />
                ))}
                
                {/* Horizontal grid lines */}
                {Array.from({ length: ALL_NOTES.length + 1 }, (_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={0}
                    y1={i * cellHeight}
                    x2={timelineWidth}
                    y2={i * cellHeight}
                    stroke="#ddd"
                    strokeWidth={1}
                  />
                ))}
              </svg>

              {/* Notes */}
              {composition.tracks.map(track => 
                track.notes.map(note => {
                  const x = timeToPosition(note.startTime);
                  const y = noteToRow(`${note.pitch}${note.octave}`) * cellHeight;
                  const width = Math.max(cellWidth * 0.8, timeToPosition(note.duration));
                  const isSelected = selectedNotes.includes(note.id);
                  const isFromSelectedTrack = track.id === selectedTrack;

                  return (
                    <motion.div
                      key={note.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute rounded cursor-pointer ${
                        isSelected 
                          ? 'ring-2 ring-blue-500 ring-offset-1' 
                          : 'hover:ring-1 hover:ring-gray-400'
                      } ${
                        !isFromSelectedTrack ? 'opacity-40' : ''
                      }`}
                      style={{
                        left: x,
                        top: y + 1,
                        width: width,
                        height: cellHeight - 2,
                        backgroundColor: track.color,
                        opacity: isFromSelectedTrack ? 0.8 : 0.3,
                        zIndex: isFromSelectedTrack ? 10 : 5
                      }}
                      onClick={(e) => handleNoteClick(note.id, e)}
                    >
                      <div className="w-full h-full flex items-center justify-center text-xs text-white font-medium">
                        {note.pitch}
                      </div>
                    </motion.div>
                  );
                })
              ).flat()}

              {/* Playhead */}
              {isPlaying && (
                <motion.div
                  className="absolute top-0 w-0.5 bg-red-500 pointer-events-none z-10"
                  style={{ 
                    left: timeToPosition(currentTime),
                    height: pianoHeight
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 