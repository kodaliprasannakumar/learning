/**
 * Music Audio Engine - Web Audio API Implementation
 * Handles audio synthesis, playback, and timing for the music studio
 */

import { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import type { Composition, Track, Note } from './MusicStudio';

interface MusicAudioEngineProps {
  composition: Composition;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  onTimeUpdate: (time: number) => void;
  onPlaybackEnd: () => void;
}

// Audio Engine Interface
interface AudioEngineRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
}

// Simple instrument definitions using Web Audio API
class SimpleInstrument {
  protected audioContext: AudioContext;
  protected masterGain: GainNode;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.masterGain = audioContext.createGain();
    this.masterGain.connect(audioContext.destination);
  }

  setVolume(volume: number) {
    this.masterGain.gain.value = volume;
  }

  playNote(frequency: number, duration: number, velocity: number = 0.8): AudioNode {
    const now = this.audioContext.currentTime;
    
    // Create oscillator for the note
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Connect the audio graph
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Set oscillator properties
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.type = 'sine';
    
    // Set envelope (attack, decay, sustain, release)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocity * 0.3, now + 0.01); // Attack
    gainNode.gain.exponentialRampToValueAtTime(velocity * 0.1, now + 0.1); // Decay
    gainNode.gain.setValueAtTime(velocity * 0.1, now + duration - 0.1); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release
    
    // Start and stop the oscillator
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    return oscillator;
  }
}

class PianoInstrument extends SimpleInstrument {
  playNote(frequency: number, duration: number, velocity: number = 0.8): AudioNode {
    const now = this.audioContext.currentTime;
    
    // Create multiple oscillators for richer piano sound
    const oscillators = [];
    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.masterGain);
    
    // Fundamental frequency
    const osc1 = this.audioContext.createOscillator();
    osc1.frequency.setValueAtTime(frequency, now);
    osc1.type = 'triangle';
    osc1.connect(gainNode);
    oscillators.push(osc1);
    
    // Second harmonic
    const osc2 = this.audioContext.createOscillator();
    osc2.frequency.setValueAtTime(frequency * 2, now);
    osc2.type = 'sine';
    const gain2 = this.audioContext.createGain();
    gain2.gain.value = 0.3;
    osc2.connect(gain2);
    gain2.connect(gainNode);
    oscillators.push(osc2);
    
    // Piano-like envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocity * 0.8, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(velocity * 0.2, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    oscillators.forEach(osc => {
      osc.start(now);
      osc.stop(now + duration);
    });
    
    return oscillators[0];
  }
}

class DrumInstrument extends SimpleInstrument {
  playNote(frequency: number, duration: number, velocity: number = 0.8): AudioNode {
    const now = this.audioContext.currentTime;
    
    // Create noise buffer for drum sound
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Add a filter for different drum sounds based on frequency
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 10, now); // Scale frequency for drum sounds
    
    const gainNode = this.audioContext.createGain();
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Drum envelope (quick attack, fast decay)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocity, now + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    noiseSource.start(now);
    noiseSource.stop(now + 0.1);
    
    return noiseSource;
  }
}

const MusicAudioEngine = forwardRef<AudioEngineRef, MusicAudioEngineProps>(({
  composition,
  isPlaying,
  currentTime,
  volume,
  onTimeUpdate,
  onPlaybackEnd
}, ref) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const instrumentsRef = useRef<Map<string, SimpleInstrument>>(new Map());
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const scheduledNotesRef = useRef<Set<string>>(new Set());

  // Initialize audio context and instruments
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create instruments
        const instruments = new Map();
        instruments.set('piano', new PianoInstrument(audioContextRef.current));
        instruments.set('drums', new DrumInstrument(audioContextRef.current));
        instruments.set('guitar', new SimpleInstrument(audioContextRef.current));
        instruments.set('violin', new SimpleInstrument(audioContextRef.current));
        instruments.set('trumpet', new SimpleInstrument(audioContextRef.current));
        instruments.set('synthesizer', new SimpleInstrument(audioContextRef.current));
        
        instrumentsRef.current = instruments;
        
        // Resume audio context if suspended (required by browsers)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    instrumentsRef.current.forEach(instrument => {
      instrument.setVolume(volume / 100);
    });
  }, [volume]);

  // Convert note to frequency
  const noteToFrequency = (pitch: string, octave: number): number => {
    const noteMap: { [key: string]: number } = {
      'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4,
      'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2
    };
    
    const noteIndex = noteMap[pitch];
    if (noteIndex === undefined) return 440; // Default to A4
    
    // Calculate frequency using A4 = 440Hz as reference
    const semitonesFromA4 = (octave - 4) * 12 + noteIndex;
    return 440 * Math.pow(2, semitonesFromA4 / 12);
  };

  // Schedule and play notes
  const scheduleNotes = (startTime: number) => {
    if (!audioContextRef.current) return;

    const currentAudioTime = audioContextRef.current.currentTime;
    const playbackTime = currentTime;
    const lookahead = 0.1; // Look ahead 100ms

    composition.tracks.forEach(track => {
      if (track.muted) return;

      const instrument = instrumentsRef.current.get(track.instrument);
      if (!instrument) return;

      track.notes.forEach(note => {
        const noteStartTime = note.startTime;
        const noteEndTime = noteStartTime + note.duration;
        
        // Check if note should be playing within the lookahead window
        if (noteStartTime >= playbackTime && 
            noteStartTime <= playbackTime + lookahead &&
            !scheduledNotesRef.current.has(note.id)) {
          
          const frequency = noteToFrequency(note.pitch, note.octave);
          const scheduleTime = currentAudioTime + (noteStartTime - playbackTime);
          
          // Schedule the note
          setTimeout(() => {
            instrument.playNote(frequency, note.duration, note.velocity * (track.volume || 1));
          }, Math.max(0, (noteStartTime - playbackTime) * 1000));
          
          scheduledNotesRef.current.add(note.id);
          
          // Remove from scheduled notes after it should have ended
          setTimeout(() => {
            scheduledNotesRef.current.delete(note.id);
          }, (noteEndTime - playbackTime) * 1000);
        }
      });
    });
  };

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const newCurrentTime = pauseTimeRef.current + elapsed;
        
        onTimeUpdate(newCurrentTime);
        scheduleNotes(newCurrentTime);
        
        // Check if composition has ended
        const maxDuration = Math.max(
          ...composition.tracks.flatMap(track => 
            track.notes.map(note => note.startTime + note.duration)
          ),
          0
        );
        
        if (newCurrentTime >= maxDuration + 1) {
          onPlaybackEnd();
        }
      }, 50); // Update every 50ms
      
      playbackTimerRef.current = timer;
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, [isPlaying, composition, onTimeUpdate, onPlaybackEnd]);

  // Expose playback controls
  useImperativeHandle(ref, () => ({
    play: async () => {
      if (!audioContextRef.current) return;
      
      // Resume audio context if needed
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      startTimeRef.current = Date.now();
      scheduledNotesRef.current.clear();
    },
    
    pause: () => {
      pauseTimeRef.current = currentTime;
    },
    
    stop: () => {
      pauseTimeRef.current = 0;
      scheduledNotesRef.current.clear();
      onTimeUpdate(0);
    },
    
    setVolume: (vol: number) => {
      instrumentsRef.current.forEach(instrument => {
        instrument.setVolume(vol / 100);
      });
    }
  }));

  // This component doesn't render anything visible
  return null;
});

MusicAudioEngine.displayName = 'MusicAudioEngine';

export default MusicAudioEngine; 