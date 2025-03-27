
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PuzzlePiece {
  id: string;
  text: string;
  order: number;
  position: { x: number; y: number };
}

export const usePuzzleGame = (onComplete?: (response: string) => void) => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [knowledgeWords, setKnowledgeWords] = useState<string[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiValidation, setAiValidation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize sample words
  useEffect(() => {
    setKnowledgeWords([
      "What", "happens", "when", "animals", "learn", "to", "talk",
      "How", "do", "rainbows", "form", "in", "the", "sky",
      "Why", "stars", "twinkle", "at", "night"
    ]);
  }, []);

  const handleDragStart = (id: string) => {
    setDraggedPiece(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPiece || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPieces(pieces.map(piece => 
      piece.id === draggedPiece 
        ? { ...piece, position: { x, y } } 
        : piece
    ));
    
    setDraggedPiece(null);
  };

  const handleWordDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word);
  };

  const handleWordDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    const word = e.dataTransfer.getData('text/plain');
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPiece: PuzzlePiece = {
      id: `piece-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: word,
      order: pieces.length,
      position: { x, y }
    };
    
    setPieces([...pieces, newPiece]);
    setAiValidation(null); // Clear previous validation when changing the sentence
  };

  const handleAddWord = (word: string) => {
    setKnowledgeWords([...knowledgeWords, word]);
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setKnowledgeWords(knowledgeWords.filter(word => word !== wordToRemove));
  };

  const handleRemovePiece = (idToRemove: string) => {
    setPieces(pieces.filter(piece => piece.id !== idToRemove));
    setAiValidation(null); // Clear previous validation when changing the sentence
  };

  const getCurrentQuestion = () => {
    // Sort pieces by x position to create a sentence
    const sortedPieces = [...pieces].sort((a, b) => a.position.x - b.position.x);
    return sortedPieces.map(piece => piece.text).join(' ');
  };

  const validateSentence = async () => {
    const question = getCurrentQuestion();
    if (!question.trim()) {
      toast.error("Please arrange some words to form a question");
      return;
    }
    
    setIsValidating(true);
    setAiValidation(null);
    
    try {
      // Get AI validation
      const { data, error } = await supabase.functions.invoke('generate-media', {
        body: {
          mode: 'text',
          prompt: `I'm a child using an app to form questions by arranging words. Here's my current arrangement: "${question}". 
          Is this a well-formed, meaningful question? If yes, just respond with "VALID". 
          If no, respond with "INVALID" followed by a very brief, child-friendly suggestion on how to improve it. Keep your response under 100 characters.`,
          max_tokens: 100
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        console.error("AI validation error:", data.error);
        throw new Error(data.error);
      }
      
      const validationResponse = data.response || "";
      setAiValidation(validationResponse);
      
      if (validationResponse.startsWith("VALID")) {
        toast.success("Your question looks good!");
      } else {
        toast.info("Your question needs improvement");
      }
    } catch (error) {
      console.error("Error validating sentence:", error);
      toast.error("Failed to validate. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmitPuzzle = async () => {
    const question = customQuestion || getCurrentQuestion();
    if (!question.trim()) {
      toast.error("Please arrange the pieces or enter a custom question");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get AI response
      const { data, error } = await supabase.functions.invoke('generate-media', {
        body: {
          mode: 'text',
          prompt: `Answer this child's question in a friendly, educational way: "${question}"`,
          max_tokens: 300
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        console.error("AI response error:", data.error);
        throw new Error(data.error);
      }
      
      setAiResponse(data.response || "I'm not sure about that. Can you try asking a different question?");
      
      if (onComplete) {
        onComplete(data.response);
      }
      
      toast.success("Puzzle completed!");
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
