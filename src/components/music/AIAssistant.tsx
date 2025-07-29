/**
 * AI Assistant - Music Intelligence and Education Component
 * Provides AI-powered suggestions for harmonies, rhythms, and musical education
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  Music, 
  Brain, 
  BookOpen, 
  Wand2,
  X,
  Send,
  Lightbulb,
  Volume2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Composition, Note, Track } from './MusicStudio';

interface AIAssistantProps {
  composition: Composition;
  selectedTrack: string;
  userCredits: number;
  onAIRequest: (type: string, context: any) => Promise<boolean>;
  onCompositionUpdate: (composition: Composition) => void;
  onClose: () => void;
}

// AI suggestion types and their credit costs
const AI_FEATURES = [
  {
    id: 'harmony',
    name: 'Harmony Suggestions',
    description: 'Get chord progressions and harmonies that complement your melody',
    icon: Music,
    cost: 2,
    color: 'blue'
  },
  {
    id: 'rhythm',
    name: 'Rhythm Patterns',
    description: 'Add interesting drum patterns and rhythmic elements',
    icon: Volume2,
    cost: 2,
    color: 'green'
  },
  {
    id: 'completion',
    name: 'Song Completion',
    description: 'AI will help complete your composition with additional sections',
    icon: Wand2,
    cost: 3,
    color: 'purple'
  },
  {
    id: 'education',
    name: 'Music Theory Tips',
    description: 'Learn about the music theory behind your composition',
    icon: BookOpen,
    cost: 1,
    color: 'amber'
  }
];

// Pre-defined AI responses for demo purposes (would integrate with OpenAI in production)
const AI_RESPONSES = {
  harmony: {
    title: "Harmony Suggestions",
    content: `Based on your melody, here are some chord suggestions:

🎵 **For a happy, uplifting sound:**
- Try C Major → F Major → G Major → C Major
- Add some Am (A minor) for emotional depth

🎵 **For a more dramatic sound:**
- Use Em → Am → F → C progression
- This creates a beautiful emotional journey!

🎵 **Pro tip:** Place chords on strong beats (1 and 3) for stability.`,
    notes: [
      { pitch: 'C', octave: 3, startTime: 0, duration: 1 },
      { pitch: 'E', octave: 3, startTime: 0, duration: 1 },
      { pitch: 'G', octave: 3, startTime: 0, duration: 1 }
    ]
  },
  rhythm: {
    title: "Rhythm Pattern Suggestions",
    content: `Here are some rhythm patterns to make your music groove:

🥁 **Basic Rock Pattern:**
- Kick drum on beats 1 and 3
- Snare drum on beats 2 and 4
- Hi-hat on every eighth note

🥁 **Jazz-inspired Pattern:**
- Swing the eighth notes
- Add syncopation with off-beat accents

🥁 **Electronic Pattern:**
- Four-on-the-floor kick pattern
- Add electronic hi-hats for energy`,
    notes: [
      // Kick drum pattern (low C for kick)
      { pitch: 'C', octave: 2, startTime: 0, duration: 0.25 },
      { pitch: 'C', octave: 2, startTime: 1, duration: 0.25 },
      { pitch: 'C', octave: 2, startTime: 2, duration: 0.25 },
      { pitch: 'C', octave: 2, startTime: 3, duration: 0.25 },
      
      // Snare drum pattern (D for snare)
      { pitch: 'D', octave: 3, startTime: 0.5, duration: 0.25 },
      { pitch: 'D', octave: 3, startTime: 1.5, duration: 0.25 },
      { pitch: 'D', octave: 3, startTime: 2.5, duration: 0.25 },
      { pitch: 'D', octave: 3, startTime: 3.5, duration: 0.25 },
      
      // Hi-hat pattern (F# for hi-hat)
      { pitch: 'F#', octave: 4, startTime: 0, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 0.25, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 0.5, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 0.75, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 1, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 1.25, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 1.5, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 1.75, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 2, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 2.25, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 2.5, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 2.75, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 3, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 3.25, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 3.5, duration: 0.125 },
      { pitch: 'F#', octave: 4, startTime: 3.75, duration: 0.125 }
    ]
  },
  completion: {
    title: "Song Structure Suggestions",
    content: `Let's complete your song with a proper structure:

🎼 **Suggested Song Structure:**
1. **Intro** (4 bars) - Start with your main melody softly
2. **Verse** (8 bars) - Your current melody works perfectly here
3. **Chorus** (8 bars) - Add higher notes and more energy
4. **Bridge** (4 bars) - Try different chords for contrast
5. **Outro** (4 bars) - Return to intro theme

🎼 **Next Steps:**
- Create a chorus melody that's higher and more energetic
- Add bass notes to support your harmony
- Consider adding a simple drum pattern`,
    notes: []
  },
  education: {
    title: "Music Theory Insights",
    content: `Let me explain the music theory in your composition:

📚 **Key and Scale:**
Your melody appears to be in C Major, which uses only white keys on the piano. This makes it perfect for beginners!

📚 **Rhythm Concepts:**
- You're using quarter notes (1 beat each)
- Try adding eighth notes (half beats) for more movement
- Dotted rhythms can add swing and interest

📚 **Melody Tips:**
- Step-wise motion (notes next to each other) sounds smooth
- Leaps (jumping to distant notes) create excitement
- Repetition helps listeners remember your melody

📚 **What to learn next:**
Learn about intervals (distances between notes) to create better melodies!`,
    notes: []
  }
};

export default function AIAssistant({
  composition,
  selectedTrack,
  userCredits,
  onAIRequest,
  onCompositionUpdate,
  onClose
}: AIAssistantProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentTrack = composition.tracks.find(track => track.id === selectedTrack);

  // Handle AI feature request
  const handleFeatureRequest = async (featureId: string) => {
    const feature = AI_FEATURES.find(f => f.id === featureId);
    if (!feature) return;

    setIsLoading(true);
    setActiveFeature(featureId);

    try {
      const success = await onAIRequest(featureId, {
        composition,
        selectedTrack,
        customPrompt: customPrompt.trim()
      });

      if (success) {
        // Simulate AI response (in production, this would come from OpenAI)
        setTimeout(() => {
          setAiResponse(AI_RESPONSES[featureId as keyof typeof AI_RESPONSES]);
          setIsLoading(false);
          toast.success(`✨ ${feature.name} generated!`);
        }, 1500);
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

  // Apply AI suggestions to composition
  const handleApplySuggestion = () => {
    if (!aiResponse || !currentTrack) return;

    console.log('Applying AI suggestion:', { 
      hasNotes: !!aiResponse.notes, 
      noteCount: aiResponse.notes?.length,
      selectedTrack,
      currentTrackId: currentTrack.id 
    });

    if (aiResponse.notes && aiResponse.notes.length > 0) {
      const newNotes: Note[] = aiResponse.notes.map((noteData: any, index: number) => ({
        id: `ai-note-${Date.now()}-${index}`,
        pitch: noteData.pitch,
        octave: noteData.octave,
        startTime: noteData.startTime,
        duration: noteData.duration,
        velocity: 0.8,
        track: selectedTrack
      }));

      console.log('Generated notes:', newNotes);

      const updatedComposition = {
        ...composition,
        tracks: composition.tracks.map(track =>
          track.id === selectedTrack
            ? { ...track, notes: [...track.notes, ...newNotes] }
            : track
        ),
        lastModified: new Date()
      };

      console.log('Updated composition:', {
        trackCount: updatedComposition.tracks.length,
        selectedTrackNotes: updatedComposition.tracks.find(t => t.id === selectedTrack)?.notes.length
      });

      onCompositionUpdate(updatedComposition);
      toast.success('🎵 AI suggestions applied to your composition!');
    } else {
      toast.success('💡 AI insights provided - use them to improve your music!');
    }

    setAiResponse(null);
    setActiveFeature(null);
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-700">AI Music Assistant</h2>
            <p className="text-sm text-purple-600">Get smart suggestions for your composition</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">
            💰 {userCredits} credits
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700 font-medium">AI is analyzing your music...</p>
          <p className="text-sm text-purple-600">This may take a few seconds</p>
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
              <h3 className="font-bold text-purple-700">{aiResponse.title}</h3>
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
            
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-gray-700">
                {aiResponse.content}
              </div>
            </div>

            {aiResponse.notes && aiResponse.notes.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Music className="h-4 w-4" />
                  <span>✨ This suggestion includes {aiResponse.notes.length} musical notes that can be added to your track</span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* AI Features */}
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
                placeholder="e.g., How can I make this melody more exciting? What instruments would sound good with this?"
                className="flex-1 resize-none h-20"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!customPrompt.trim() || userCredits < 1}
                onClick={() => handleFeatureRequest('education')}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* AI Feature Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AI_FEATURES.map(feature => {
              const IconComponent = feature.icon;
              const canAfford = userCredits >= feature.cost;
              const colorClasses = {
                blue: 'from-blue-100 to-cyan-50 border-blue-200',
                green: 'from-green-100 to-emerald-50 border-green-200',
                purple: 'from-purple-100 to-violet-50 border-purple-200',
                amber: 'from-amber-100 to-yellow-50 border-amber-200'
              };

              return (
                <Card
                  key={feature.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md bg-gradient-to-br ${
                    colorClasses[feature.color as keyof typeof colorClasses]
                  } ${!canAfford ? 'opacity-50' : ''}`}
                  onClick={() => canAfford && handleFeatureRequest(feature.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      feature.color === 'blue' ? 'bg-blue-200' :
                      feature.color === 'green' ? 'bg-green-200' :
                      feature.color === 'purple' ? 'bg-purple-200' :
                      'bg-amber-200'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{feature.name}</h4>
                        <Badge 
                          variant={canAfford ? "secondary" : "outline"} 
                          className="text-xs"
                        >
                          {feature.cost}💰
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Current Track Info */}
          {currentTrack && (
            <Card className="p-3 bg-white border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Current Track Analysis</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>🎵 Track: {currentTrack.name} ({currentTrack.instrument})</p>
                <p>🎼 Notes: {currentTrack.notes.length}</p>
                <p>⏱️ Duration: {Math.max(...currentTrack.notes.map(n => n.startTime + n.duration), 0).toFixed(1)}s</p>
                <p>🎶 BPM: {composition.bpm}</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </Card>
  );
} 