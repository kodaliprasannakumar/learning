import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Confetti } from "@/components/Confetti";
import { Lightbulb, RefreshCw, CheckCircle, BookOpen } from "lucide-react";

// Define a type for our quotes
interface Quote {
  text: string;
  author: string;
  category: string;
}

export default function QuotePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [hiddenPart, setHiddenPart] = useState<{ text: string, startIdx: number } | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wordSuggestions, setWordSuggestions] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null);

  // Demo quotes array - in a real app, these would come from an API
  const demoQuotes: Quote[] = [
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "confidence" },
    { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne", category: "courage" },
    { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss", category: "learning" },
    { text: "Be kind whenever possible. It is always possible.", author: "Dalai Lama", category: "kindness" },
    { text: "Nothing is impossible, the word itself says I'm possible!", author: "Audrey Hepburn", category: "perseverance" }
  ];

  // Generate word suggestions based on the missing word
  const generateWordSuggestions = (correctWord: string) => {
    // Include the correct word
    const suggestions: string[] = [correctWord];
    
    // Add some plausible but incorrect options
    const alternatives = [
      // Common words that might fit in inspirational quotes
      "hope", "dream", "faith", "brave", "smart", 
      "strong", "happy", "smile", "learn", "think",
      "laugh", "great", "heart", "power", "light", 
      "world", "right", "truth", "peace", "mind"
    ];
    
    // Filter out the correct word from alternatives
    const filteredAlternatives = alternatives.filter(word => 
      word.toLowerCase() !== correctWord.toLowerCase()
    );
    
    // Add 3 random alternatives
    while (suggestions.length < 4 && filteredAlternatives.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredAlternatives.length);
      const word = filteredAlternatives.splice(randomIndex, 1)[0];
      suggestions.push(word);
    }
    
    // Shuffle the suggestions
    return suggestions.sort(() => Math.random() - 0.5);
  };

  // Get AI explanation for the quote
  const getQuoteExplanation = async (quoteText: string, author: string) => {
    setIsExplanationLoading(true);
    
    try {
      // In a real app, this would be an API call to an AI service
      // For demo purposes, we'll simulate a response with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated AI responses based on the quote's author
      const explanations: Record<string, string> = {
        "Theodore Roosevelt": "This quote by Theodore Roosevelt emphasizes the power of self-belief. When you believe in your abilities, you've already overcome a major obstacle to success. Children who develop confidence in themselves are more likely to persevere through challenges and achieve their goals.",
        
        "A.A. Milne": "A.A. Milne, creator of Winnie the Pooh, reminds us that we often underestimate our own abilities. This quote teaches children to recognize their inner strength, courage, and intelligence, even when facing difficult situations. It's a powerful message about self-confidence and resilience.",
        
        "Dr. Seuss": "Dr. Seuss emphasizes the importance of reading and learning as pathways to opportunity and adventure. This quote encourages children to be curious, to seek knowledge, and to understand that education opens doors to new possibilities and experiences.",
        
        "Dalai Lama": "The Dalai Lama's simple yet profound message teaches that kindness is always a choice available to us. This quote helps children understand that being kind is within their control no matter the circumstances, and that compassion toward others is a value worth practicing every day.",
        
        "Audrey Hepburn": "Audrey Hepburn's clever wordplay on 'impossible' reveals that even seemingly insurmountable challenges contain the seeds of possibility. This quote encourages children to approach obstacles with optimism and creativity, seeing opportunities where others might see limitations."
      };
      
      // Get the explanation based on the author, or use a default
      const explanation = explanations[author] || 
        `This inspirational quote by ${author} reminds us that positive thinking and perseverance are important qualities to develop. When we face challenges with the right mindset, we can overcome obstacles and achieve our goals.`;
      
      setExplanation(explanation);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load the explanation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExplanationLoading(false);
    }
  };

  const fetchNewQuote = async () => {
    setIsLoading(true);
    setIsCorrect(false);
    setUserInput("");
    setExplanation(null);
    setWordSuggestions([]);

    try {
      // In a real app, fetch from API - using demo data for now
      const randomIndex = Math.floor(Math.random() * demoQuotes.length);
      const selectedQuote = demoQuotes[randomIndex];
      setQuote(selectedQuote);

      // Create a hidden part of the quote
      const words = selectedQuote.text.split(' ');
      
      // Find a meaningful word to hide (at least 4 letters)
      let wordToHideIndex = 0;
      let attempts = 0;
      
      while (attempts < 10) {
        const randomWordIndex = Math.floor(Math.random() * words.length);
        if (words[randomWordIndex].length >= 4 && 
            !words[randomWordIndex].includes('.') && 
            !words[randomWordIndex].includes(',')) {
          wordToHideIndex = randomWordIndex;
          break;
        }
        attempts++;
      }
      
      const originalWord = words[wordToHideIndex].replace(/[.,!?]/g, '');
      
      // Find where this word starts in the original string
      const startIdx = selectedQuote.text.indexOf(originalWord);
      
      setHiddenPart({
        text: originalWord,
        startIdx: startIdx
      });

      // Generate word suggestions
      const suggestions = generateWordSuggestions(originalWord);
      setWordSuggestions(suggestions);

      // In a real app, generate image based on quote using AI
      setImageUrl(`https://source.unsplash.com/400x300/?${selectedQuote.category}`);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load a new quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnswer = () => {
    if (!hiddenPart || !quote) return;
    
    const isAnswerCorrect = userInput.trim().toLowerCase() === hiddenPart.text.toLowerCase();
    
    if (isAnswerCorrect) {
      setIsCorrect(true);
      setShowConfetti(true);
      toast({
        title: "Great job! 🎉",
        description: "You completed the quote correctly!",
        variant: "default"
      });
      
      // Get AI explanation for the quote
      getQuoteExplanation(quote.text, quote.author);
      
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    } else {
      toast({
        title: "Not quite right",
        description: "Try again with a different word.",
        variant: "default"
      });
    }
  };

  useEffect(() => {
    fetchNewQuote();
  }, []);

  if (!quote || !hiddenPart) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kid-blue"></div>
      </div>
    );
  }

  const displayQuote = () => {
    if (!quote || !hiddenPart) return null;
    
    const beforeHidden = quote.text.substring(0, hiddenPart.startIdx);
    const afterHidden = quote.text.substring(hiddenPart.startIdx + hiddenPart.text.length);
    
    return (
      <div className="text-2xl font-medium leading-relaxed">
        {beforeHidden}
        {isCorrect ? (
          <span className="text-green-600 font-bold">{hiddenPart.text}</span>
        ) : (
          <span className="inline-flex bg-kid-blue/20 rounded-md text-kid-blue align-center">
            <Input 
              className="h-auto py-2 px-3 border-none text-center font-bold bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type word here"
              maxLength={20}
            />
          </span>
        )}
        {afterHidden}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {showConfetti && <Confetti />}
      
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Lightbulb className="h-12 w-12 text-amber-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-amber-700 text-transparent bg-clip-text">
          Daily Wisdom
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Complete the missing word in today's inspirational quote to build your wisdom!
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="border-4 border-amber-400/30 bg-gradient-to-br from-amber-50 to-amber-100/50 p-8 rounded-2xl shadow-lg">
          {imageUrl && (
            <div className="mb-8 flex justify-center">
              {/* <img 
                src={imageUrl} 
                alt="Quote illustration"
                className="rounded-lg shadow-md max-h-[300px] object-cover"
              /> */}
            </div>
          )}
          
          <div className="mb-6 text-center">
            {displayQuote()}
            
            <div className="mt-4 text-right text-lg italic text-gray-600">
              — {quote.author}
            </div>
          </div>

          {!isCorrect && wordSuggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-center text-amber-700">
                Word Suggestions
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {wordSuggestions.map((word, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800"
                    onClick={() => setUserInput(word)}
                  >
                    {word}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isCorrect ? (
              <Button 
                onClick={checkAnswer}
                className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg flex-1"
                disabled={userInput.trim() === ""}
              >
                <CheckCircle className="mr-2 h-5 w-5" /> Check Answer
              </Button>
            ) : (
              <Button 
                onClick={fetchNewQuote}
                className="bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg flex-1"
              >
                <RefreshCw className="mr-2 h-5 w-5" /> Try Another Quote
              </Button>
            )}
          </div>
          
          {isCorrect && (
            <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-green-100 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-700">
                  Quote Explained
                </h3>
              </div>
              
              {isExplanationLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <p className="text-lg text-muted-foreground">
                  {explanation}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-10 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-amber-700">Why Daily Quotes Matter</h2>
          <p className="text-muted-foreground mb-4">
            Inspirational quotes can help kids develop:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <li className="flex items-start gap-2">
              <div className="bg-green-100 rounded-full p-1 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <span>A positive mindset and outlook on challenges</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-green-100 rounded-full p-1 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <span>Emotional intelligence and self-awareness</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-green-100 rounded-full p-1 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <span>Improved vocabulary and language skills</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-green-100 rounded-full p-1 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <span>Critical thinking and reflection abilities</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 