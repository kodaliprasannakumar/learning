
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import KnowledgeBox from './puzzle/KnowledgeBox';
import PuzzleEditor from './puzzle/PuzzleEditor';
import SentenceValidator from './puzzle/SentenceValidator';
import CustomQuestion from './puzzle/CustomQuestion';
import AiResponse from './puzzle/AiResponse';
import { usePuzzleGame } from '@/hooks/usePuzzleGame';

interface PuzzleGameProps {
  initialPrompt?: string;
  onComplete?: (response: string) => void;
}

const PuzzleGame = ({ initialPrompt = "Arrange the pieces to form a question", onComplete }: PuzzleGameProps) => {
  const {
    pieces,
    knowledgeWords,
    draggedPiece,
    customQuestion,
    aiResponse,
    aiValidation,
    isSubmitting,
    isValidating,
    containerRef,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleWordDragStart,
    handleWordDrop,
    handleAddWord,
    handleRemoveWord,
    handleRemovePiece,
    getCurrentQuestion,
    validateSentence,
    handleSubmitPuzzle,
    setCustomQuestion
  } = usePuzzleGame(onComplete);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Puzzle Game</h2>
      <p className="text-center mb-6 text-muted-foreground">{initialPrompt}</p>
      
      <KnowledgeBox 
        words={knowledgeWords}
        onAddWord={handleAddWord}
        onRemoveWord={handleRemoveWord}
        onDragStart={handleWordDragStart}
      />
      
      <PuzzleEditor 
        pieces={pieces}
        draggedPiece={draggedPiece}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onRemovePiece={handleRemovePiece}
      />
      
      <SentenceValidator 
        currentQuestion={getCurrentQuestion()}
        aiValidation={aiValidation}
        isValidating={isValidating}
        onValidate={validateSentence}
      />
      
      <CustomQuestion 
        value={customQuestion}
        onChange={setCustomQuestion}
      />
      
      <Button 
        onClick={handleSubmitPuzzle} 
        disabled={isSubmitting || (pieces.length === 0 && !customQuestion)}
        className="w-full bg-kid-blue hover:bg-kid-blue/80 text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Getting Answer...</span>
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            <span>Ask Question</span>
          </>
        )}
      </Button>
      
      <AiResponse response={aiResponse} />
    </Card>
  );
};

export default PuzzleGame;
