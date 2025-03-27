
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SentenceValidatorProps {
  currentQuestion: string;
  aiValidation: string | null;
  isValidating: boolean;
  onValidate: () => void;
}

const SentenceValidator = ({ 
  currentQuestion, 
  aiValidation, 
  isValidating, 
  onValidate 
}: SentenceValidatorProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-muted-foreground">Current arrangement:</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onValidate}
          disabled={isValidating || !currentQuestion}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <span>Check Sentence</span>
          )}
        </Button>
      </div>
      <div className="bg-muted p-3 rounded-lg min-h-12">
        {currentQuestion || "Start dragging the words!"}
      </div>
      
      {aiValidation && (
        <div className={`mt-2 p-2 rounded-lg text-sm ${aiValidation.startsWith("VALID") ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" : "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"}`}>
          {aiValidation.replace(/^(VALID|INVALID)/, '').trim()}
        </div>
      )}
    </div>
  );
};

export default SentenceValidator;
