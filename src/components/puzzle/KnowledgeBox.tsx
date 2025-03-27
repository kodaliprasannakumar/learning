
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface KnowledgeBoxProps {
  words: string[];
  onAddWord: (word: string) => void;
  onRemoveWord: (word: string) => void;
  onDragStart: (e: React.DragEvent, word: string) => void;
}

const KnowledgeBox = ({ words, onAddWord, onRemoveWord, onDragStart }: KnowledgeBoxProps) => {
  const [newWord, setNewWord] = useState('');

  const handleAddWord = () => {
    if (newWord.trim()) {
      onAddWord(newWord.trim());
      setNewWord('');
      toast.success("Word added to knowledge box!");
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Knowledge Box</h3>
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Add a new word"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
        />
        <Button onClick={handleAddWord} variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bg-muted p-3 rounded-lg min-h-20 flex flex-wrap gap-2">
        {words.map((word) => (
          <div
            key={word}
            draggable
            onDragStart={(e) => onDragStart(e, word)}
            className="bg-muted-foreground/20 px-3 py-1 rounded-lg cursor-move flex items-center gap-1 hover:bg-muted-foreground/30 transition-colors"
          >
            {word}
            <button 
              onClick={() => onRemoveWord(word)}
              className="text-muted-foreground hover:text-destructive ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {words.length === 0 && (
          <p className="text-muted-foreground text-sm">Add words to your knowledge box!</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">Drag words from here to the editor below</p>
    </div>
  );
};

export default KnowledgeBox;
