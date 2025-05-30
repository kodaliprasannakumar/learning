import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { 
  Brain, 
  Database, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  Zap,
  Award,
  Coins,
  ArrowRight,
  Bot,
  Rocket,
  Star,
  Cpu,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for our AI training system
interface TrainingData {
  input: string;
  output: string;
  category: string;
}

interface ModelPerformance {
  accuracy: number;
  trainingProgress: number;
  predictions: number;
  correctPredictions: number;
}

interface AIModel {
  id: string;
  name: string;
  type: 'text-classifier' | 'sentiment-analyzer' | 'pattern-recognizer';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  trainingData: TrainingData[];
  performance: ModelPerformance;
  isTraining: boolean;
  isTrained: boolean;
}

// Credit costs
const TRAINING_COST = 5;
const PREDICTION_COST = 1;

const AITrainerPage = () => {
  const { user } = useAuth();
  const { credits, spendCredits, earnCredits } = useCreditSystem();
  
  const [selectedModel, setSelectedModel] = useState<string>('text-classifier');
  const [currentStep, setCurrentStep] = useState<'learn' | 'data' | 'train' | 'test'>('learn');
  const [models, setModels] = useState<Record<string, AIModel>>({});
  const [userInput, setUserInput] = useState('');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize models
  useEffect(() => {
    const initialModels: Record<string, AIModel> = {
      'text-classifier': {
        id: 'text-classifier',
        name: 'Text Classifier',
        type: 'text-classifier',
        description: 'Learn to classify text into different categories like happy/sad or animal/food',
        difficulty: 'beginner',
        trainingData: [
          { input: 'I love ice cream!', output: 'happy', category: 'emotion' },
          { input: 'This is boring', output: 'sad', category: 'emotion' },
          { input: 'What a beautiful day!', output: 'happy', category: 'emotion' },
          { input: 'I feel terrible', output: 'sad', category: 'emotion' },
        ],
        performance: { accuracy: 0, trainingProgress: 0, predictions: 0, correctPredictions: 0 },
        isTraining: false,
        isTrained: false,
      },
      'sentiment-analyzer': {
        id: 'sentiment-analyzer',
        name: 'Sentiment Analyzer',
        type: 'sentiment-analyzer',
        description: 'Analyze the mood and feelings in text messages',
        difficulty: 'intermediate',
        trainingData: [
          { input: 'This movie is amazing!', output: 'positive', category: 'sentiment' },
          { input: 'I hate waiting in line', output: 'negative', category: 'sentiment' },
          { input: 'The weather is okay', output: 'neutral', category: 'sentiment' },
          { input: 'Best day ever!', output: 'positive', category: 'sentiment' },
        ],
        performance: { accuracy: 0, trainingProgress: 0, predictions: 0, correctPredictions: 0 },
        isTraining: false,
        isTrained: false,
      },
      'pattern-recognizer': {
        id: 'pattern-recognizer',
        name: 'Pattern Recognizer',
        type: 'pattern-recognizer',
        description: 'Find patterns in sequences and predict what comes next',
        difficulty: 'advanced',
        trainingData: [
          { input: '1, 2, 3, 4', output: '5', category: 'number-sequence' },
          { input: 'red, blue, red, blue', output: 'red', category: 'color-pattern' },
          { input: 'A, B, C, D', output: 'E', category: 'letter-sequence' },
          { input: 'cat, dog, cat, dog', output: 'cat', category: 'word-pattern' },
        ],
        performance: { accuracy: 0, trainingProgress: 0, predictions: 0, correctPredictions: 0 },
        isTraining: false,
        isTrained: false,
      },
    };
    setModels(initialModels);
  }, []);

  const currentModel = models[selectedModel];

  // Reset step when switching models - ensure proper flow for each model
  useEffect(() => {
    if (currentModel) {
      // If the current model is not trained, reset to appropriate step
      if (!currentModel.isTrained) {
        // If user is on test step but model isn't trained, go back to learn
        if (currentStep === 'test') {
          setCurrentStep('learn');
        }
      }
      // Only clear prediction when switching models, not on every state change
      // setPrediction(null); // Removed this line
      // setUserInput(''); // Removed this line
    }
  }, [currentModel?.isTrained, currentStep]); // Changed dependencies

  // Handle model selection with proper flow reset
  const handleModelSelection = (modelId: string) => {
    const previousModel = selectedModel;
    setSelectedModel(modelId);
    const model = models[modelId];
    
    // Only clear state when actually switching to a different model
    if (previousModel !== modelId) {
      // Show informative message when switching models
      if (!model || !model.isTrained) {
        toast.info(`Switched to ${model?.name}. This model needs to be trained separately!`);
      } else {
        toast.success(`Switched to ${model.name}. This model is already trained!`);
      }
      
      // Clear prediction and input only when switching models
      setPrediction(null);
      setUserInput('');
    }
    
    // Reset to appropriate step based on model state
    if (!model || !model.isTrained) {
      setCurrentStep('learn');
    }
  };

  // Add training data
  const addTrainingData = (input: string, output: string, category: string) => {
    if (!input.trim() || !output.trim()) {
      toast.error('Please fill in both input and output fields');
      return;
    }

    setModels(prev => ({
      ...prev,
      [selectedModel]: {
        ...prev[selectedModel],
        trainingData: [
          ...prev[selectedModel].trainingData,
          { input: input.trim(), output: output.trim(), category }
        ]
      }
    }));

    toast.success('Training data added!');
  };

  // Simulate AI model training
  const trainModel = async () => {
    if (credits < TRAINING_COST) {
      toast.error(`You need ${TRAINING_COST} credits to train a model. You have ${credits} credits.`);
      return;
    }

    const success = await spendCredits(TRAINING_COST, `Training ${currentModel.name}`);
    if (!success) {
      toast.error('Failed to process credits');
      return;
    }

    setModels(prev => ({
      ...prev,
      [selectedModel]: {
        ...prev[selectedModel],
        isTraining: true,
        performance: { ...prev[selectedModel].performance, trainingProgress: 0 }
      }
    }));

    // Simulate training progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setModels(prev => ({
        ...prev,
        [selectedModel]: {
          ...prev[selectedModel],
          performance: { ...prev[selectedModel].performance, trainingProgress: i }
        }
      }));
    }

    // Calculate accuracy based on training data size
    const accuracy = Math.min(95, 60 + (currentModel.trainingData.length * 5));

    setModels(prev => ({
      ...prev,
      [selectedModel]: {
        ...prev[selectedModel],
        isTraining: false,
        isTrained: true,
        performance: {
          ...prev[selectedModel].performance,
          accuracy,
          trainingProgress: 100
        }
      }
    }));

    toast.success(`Model trained successfully! Accuracy: ${accuracy}%`);
  };

  // Make prediction with trained model
  const makePrediction = async () => {
    if (!currentModel.isTrained) {
      toast.error('Please train the model first!');
      return;
    }

    if (!userInput.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    if (credits < PREDICTION_COST) {
      toast.error(`You need ${PREDICTION_COST} credit to make a prediction. You have ${credits} credits.`);
      return;
    }

    const success = await spendCredits(PREDICTION_COST, `Prediction with ${currentModel.name}`);
    if (!success) {
      toast.error('Failed to process credits');
      return;
    }

    setIsLoading(true);

    // Simulate AI prediction
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple prediction logic based on model type
    let result = '';
    
    switch (currentModel.type) {
      case 'text-classifier':
        // More robust text classification logic
        const positiveWords = ['love', 'great', 'amazing', 'awesome', 'fantastic', 'wonderful', 'excellent', 'best', 'happy', 'good', 'like'];
        const negativeWords = ['hate', 'terrible', 'awful', 'worst', 'bad', 'sad', 'angry', 'boring', 'horrible', 'dislike'];
        
        const lowerInput = userInput.toLowerCase();
        const hasPositive = positiveWords.some(word => lowerInput.includes(word));
        const hasNegative = negativeWords.some(word => lowerInput.includes(word));
        
        if (hasPositive && !hasNegative) {
          result = 'happy';
        } else if (hasNegative && !hasPositive) {
          result = 'sad';
        } else if (hasPositive && hasNegative) {
          result = 'mixed';
        } else {
          result = 'neutral';
        }
        break;
      case 'sentiment-analyzer':
        if (userInput.toLowerCase().includes('love') || userInput.toLowerCase().includes('great') || userInput.toLowerCase().includes('amazing') || userInput.toLowerCase().includes('best')) {
          result = 'positive';
        } else if (userInput.toLowerCase().includes('hate') || userInput.toLowerCase().includes('terrible') || userInput.toLowerCase().includes('awful') || userInput.toLowerCase().includes('worst')) {
          result = 'negative';
        } else {
          result = 'neutral';
        }
        break;
      case 'pattern-recognizer':
        // Improved pattern recognition logic
        const input = userInput.trim();
        
        // Number sequence detection
        const numberMatch = input.match(/(\d+),?\s*(\d+),?\s*(\d+)/);
        if (numberMatch) {
          const [, a, b, c] = numberMatch.map(Number);
          const diff1 = b - a;
          const diff2 = c - b;
          
          if (diff1 === diff2) {
            // Arithmetic sequence
            result = (c + diff1).toString();
          } else {
            // Try geometric or other patterns
            const ratio = b / a;
            if (c / b === ratio && ratio !== 0) {
              result = (c * ratio).toString();
            } else {
              result = 'Complex pattern detected';
            }
          }
        }
        // Letter sequence detection
        else if (input.match(/[A-Za-z],?\s*[A-Za-z],?\s*[A-Za-z]/)) {
          const letters = input.replace(/[^A-Za-z]/g, '').toUpperCase();
          if (letters.length >= 3) {
            const codes = letters.split('').map(l => l.charCodeAt(0));
            const diff1 = codes[1] - codes[0];
            const diff2 = codes[2] - codes[1];
            
            if (diff1 === diff2 && diff1 === 1) {
              // Simple alphabetical sequence like A,B,C
              const nextCode = codes[codes.length - 1] + diff1;
              if (nextCode <= 90) { // Within A-Z range
                result = String.fromCharCode(nextCode);
              } else {
                result = 'End of alphabet reached';
              }
            } else if (diff1 === diff2) {
              // Other consistent letter patterns
              const nextCode = codes[codes.length - 1] + diff1;
              if (nextCode >= 65 && nextCode <= 90) {
                result = String.fromCharCode(nextCode);
              } else {
                result = 'Pattern exceeds alphabet';
              }
            } else {
              result = 'Complex letter pattern';
            }
          }
        }
        // Color or word pattern detection
        else if (input.toLowerCase().includes('red') || input.toLowerCase().includes('blue') || input.toLowerCase().includes('green')) {
          const words = input.toLowerCase().split(/[,\s]+/).filter(w => w.length > 0);
          if (words.length >= 2) {
            // Simple alternating pattern detection
            if (words[0] === words[2]) {
              result = words[0];
            } else {
              result = `Pattern suggests: ${words[1]}`;
            }
          }
        }
        // Fallback for other patterns
        else {
          result = 'Unable to detect clear pattern';
        }
        break;
    }

    setPrediction(result);
    
    // Update model performance
    setModels(prev => ({
      ...prev,
      [selectedModel]: {
        ...prev[selectedModel],
        performance: {
          ...prev[selectedModel].performance,
          predictions: prev[selectedModel].performance.predictions + 1,
          correctPredictions: prev[selectedModel].performance.correctPredictions + 1
        }
      }
    }));

    setIsLoading(false);
    toast.success(`Prediction complete! Result: ${result}`);
  };

  const resetModel = () => {
    setModels(prev => ({
      ...prev,
      [selectedModel]: {
        ...prev[selectedModel],
        isTraining: false,
        isTrained: false,
        performance: { accuracy: 0, trainingProgress: 0, predictions: 0, correctPredictions: 0 }
      }
    }));
    setPrediction(null);
    toast.info('Model reset successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Modern Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-4 rounded-2xl shadow-2xl">
                <Bot className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-700 via-blue-600 to-indigo-700 text-transparent bg-clip-text leading-tight">
            AI Trainer Academy
          </h1>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
              <p className="text-xl text-gray-700 font-medium leading-relaxed mb-6">
                Build, train, and test your own AI models with hands-on learning
              </p>
              
              <div className="flex justify-center items-center gap-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
                  <Coins className="h-5 w-5" />
                  <span className="font-bold text-lg">{credits}</span>
                  <span className="text-sm opacity-90">Credits</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sleek Model Selection */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              Choose Your AI Model
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Select from our collection of AI models, each designed for different types of learning experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.values(models).map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={() => handleModelSelection(model.id)}
              >
                <Card className={`p-8 h-full transition-all duration-300 hover:shadow-2xl rounded-2xl border-2 ${
                  selectedModel === model.id 
                    ? 'ring-4 ring-purple-400/30 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-300 shadow-2xl' 
                    : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 border-gray-200 shadow-lg'
                }`}>
                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4 transition-all duration-300 ${
                      selectedModel === model.id ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-xl' :
                      model.difficulty === 'beginner' ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' :
                      model.difficulty === 'intermediate' ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-600' : 
                      'bg-gradient-to-br from-red-100 to-pink-100 text-red-600'
                    }`}>
                      {model.type === 'text-classifier' ? <Brain className="h-8 w-8" /> :
                       model.type === 'sentiment-analyzer' ? <BarChart3 className="h-8 w-8" /> : <Cpu className="h-8 w-8" />}
                    </div>
                    
                    <h3 className="font-bold text-2xl text-gray-800 mb-2">{model.name}</h3>
                    
                    <Badge 
                      variant="secondary"
                      className={`text-white font-semibold px-4 py-2 text-sm ${
                        model.difficulty === 'beginner' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        model.difficulty === 'intermediate' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                        'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                    >
                      {model.difficulty === 'beginner' ? 'Beginner' :
                       model.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-6 text-center leading-relaxed text-sm">{model.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Training Examples</span>
                      <span className="font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {model.trainingData.length}
                      </span>
                    </div>
                    
                    <div className="flex justify-center">
                      {model.isTraining && (
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold">Training...</span>
                        </div>
                      )}
                      {model.isTrained && !model.isTraining && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-600 px-4 py-2 rounded-full">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-semibold">Trained ({model.performance.accuracy}%)</span>
                        </div>
                      )}
                      {!model.isTrained && !model.isTraining && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                          Ready to train
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sleek Progress Navigation */}
        <motion.div 
          className="flex justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/50">
            <div className="flex items-center space-x-8">
              {[
                { 
                  key: 'learn', 
                  icon: BookOpen, 
                  label: 'Learn', 
                  gradient: 'from-emerald-500 to-teal-500',
                  bgGradient: 'from-emerald-50 to-teal-50'
                },
                { 
                  key: 'data', 
                  icon: Database, 
                  label: 'Data', 
                  gradient: 'from-blue-500 to-cyan-500',
                  bgGradient: 'from-blue-50 to-cyan-50'
                },
                { 
                  key: 'train', 
                  icon: Cpu, 
                  label: 'Train', 
                  gradient: 'from-purple-500 to-violet-500',
                  bgGradient: 'from-purple-50 to-violet-50'
                },
                { 
                  key: 'test', 
                  icon: Target, 
                  label: 'Test', 
                  gradient: 'from-pink-500 to-rose-500',
                  bgGradient: 'from-pink-50 to-rose-50'
                }
              ].map((step, index) => {
                const isCurrentStep = currentStep === step.key;
                const isCompleted = 
                  (step.key === 'learn') ||
                  (step.key === 'data' && (currentStep === 'data' || currentStep === 'train' || currentStep === 'test')) ||
                  (step.key === 'train' && (currentStep === 'train' || currentStep === 'test')) ||
                  (step.key === 'test' && currentStep === 'test' && currentModel?.isTrained);
                
                const isAccessible = 
                  (step.key === 'learn') ||
                  (step.key === 'data') ||
                  (step.key === 'train' && currentModel?.trainingData.length >= 3) ||
                  (step.key === 'test' && currentModel?.isTrained);

                return (
                  <div key={step.key} className="flex items-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => isAccessible ? setCurrentStep(step.key as any) : null}
                        disabled={!isAccessible}
                        className={`flex flex-col items-center gap-3 p-6 rounded-xl min-w-[120px] h-auto transition-all duration-300 ${
                          isCurrentStep 
                            ? `bg-gradient-to-br ${step.bgGradient} border-2 border-current shadow-xl scale-105` 
                            : isCompleted
                            ? 'bg-green-50 border-2 border-green-200 shadow-md hover:shadow-lg'
                            : !isAccessible
                            ? 'opacity-40 cursor-not-allowed bg-gray-50'
                            : 'bg-white/60 hover:bg-white/80 border-2 border-gray-100 hover:shadow-lg'
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${
                          isCurrentStep ? `bg-gradient-to-br ${step.gradient} text-white shadow-lg` :
                          isCompleted ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          <step.icon className="h-6 w-6" />
                        </div>
                        <span className={`font-semibold text-sm ${
                          isCurrentStep ? 'text-gray-800' : 
                          isCompleted ? 'text-green-700' : 
                          'text-gray-600'
                        }`}>
                          {step.label}
                        </span>
                        {isCompleted && step.key !== 'test' && !isCurrentStep && (
                          <CheckCircle className="h-4 w-4 text-green-600 absolute -top-1 -right-1" />
                        )}
                      </Button>
                    </motion.div>
                    {index < 3 && (
                      <div className={`w-12 h-0.5 mx-4 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
          {/* Learn Tab */}
          <TabsContent value="learn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center mb-12">
                <div className="bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/50">
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-xl">
                      <Lightbulb className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-4xl font-bold mb-6 text-gray-800">
                    How AI Magic Works
                  </h2>
                  
                  <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Discover the fascinating world of artificial intelligence through hands-on learning. 
                    Build, train, and test your own AI models step by step.
                  </p>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => setCurrentStep('data')}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl text-xl"
                    >
                      <Rocket className="h-6 w-6 mr-3" />
                      Start Building Your AI
                      <ArrowRight className="h-6 w-6 ml-3" />
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              {/* Learning Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: Database,
                    title: "1. Collect Data",
                    description: "AI learns from examples, just like you do! Gather different types of data to teach your AI model patterns and relationships.",
                    gradient: "from-blue-500 to-cyan-500",
                    bgGradient: "from-blue-50 to-cyan-50"
                  },
                  {
                    icon: Cpu,
                    title: "2. Train Your AI",
                    description: "During training, your AI studies all examples and discovers hidden patterns. The more data you provide, the smarter it becomes!",
                    gradient: "from-purple-500 to-violet-500",
                    bgGradient: "from-purple-50 to-violet-50"
                  },
                  {
                    icon: Target,
                    title: "3. Test & Predict",
                    description: "Put your trained AI to the test! See how well it performs on new, unseen data and watch it make intelligent predictions.",
                    gradient: "from-green-500 to-emerald-500",
                    bgGradient: "from-green-50 to-emerald-50"
                  },
                  {
                    icon: TrendingUp,
                    title: "4. Improve & Iterate",
                    description: "Learn from mistakes and make your AI even better! Add more data, adjust settings, and watch your model's performance soar.",
                    gradient: "from-orange-500 to-red-500",
                    bgGradient: "from-orange-50 to-red-50"
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`bg-gradient-to-br ${step.bgGradient} p-8 rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm`}
                  >
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${step.gradient} text-white shadow-lg mb-6`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    
                    <h3 className="font-bold text-xl text-gray-800 mb-4">{step.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-kid-green to-kid-blue p-8 rounded-3xl shadow-xl border-4 border-white/30">
                <h2 className="text-3xl font-bold mb-8 text-center text-black flex items-center justify-center gap-3">
                  
                   Training Data for {currentModel?.name}
                </h2>
                
                {/* Current Training Data */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    📚 Current Magic Examples
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {currentModel?.trainingData.map((data, index) => (
                      <motion.div 
                        key={index} 
                        className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 shadow-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <span className="font-semibold text-blue-800">Input:</span> 
                            <span className="text-gray-700 ml-2">"{data.input}"</span>
                            <span className="mx-3 text-2xl">→</span>
                            <span className="font-semibold text-purple-800">Output:</span> 
                            <span className="text-gray-700 ml-2">"{data.output}"</span>
                          </div>
                          <Badge variant="outline" className="bg-white/80 text-gray-600 border-gray-300">
                            {data.category}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Add New Data */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    ➕ Add Your Own Magic Examples
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">✍️ Input Text</label>
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-blue-200 rounded-xl bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Enter example text..."
                        id="input-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">🎯 Expected Output</label>
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-purple-200 rounded-xl bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
                        placeholder="What should AI predict?"
                        id="output-text"
                      />
                    </div>
                    <div className="flex items-end">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <Button
                          onClick={() => {
                            const input = (document.getElementById('input-text') as HTMLInputElement)?.value;
                            const output = (document.getElementById('output-text') as HTMLInputElement)?.value;
                            if (input && output) {
                              addTrainingData(input, output, currentModel?.type || 'general');
                              (document.getElementById('input-text') as HTMLInputElement).value = '';
                              (document.getElementById('output-text') as HTMLInputElement).value = '';
                            }
                          }}
                          className="w-full bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg"
                        >
                          ✨ Add Example
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => setCurrentStep('train')}
                      disabled={currentModel?.trainingData.length < 3}
                      size="lg"
                      className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg text-xl disabled:opacity-50"
                    >
                      🧠 Ready to Train! <ArrowRight className="h-6 w-6 ml-2" />
                    </Button>
                  </motion.div>
                  {currentModel?.trainingData.length < 3 && (
                    <p className="text-white mt-3 bg-red-400/80 backdrop-blur-sm rounded-full py-2 px-4 inline-block">
                      🚨 Need at least 3 examples to start training!
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Train Tab */}
          <TabsContent value="train">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-kid-purple to-kid-pink p-8 rounded-3xl shadow-xl border-4 border-white/30">
                <h2 className="text-3xl font-bold mb-8 text-center text-black flex items-center justify-center gap-3">
                  
                  🧠 Train Your {currentModel?.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Training Status */}
                  <div className="space-y-6">
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                      <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
                        📊 Training Status
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">🎯 Progress:</span>
                          <span className="font-bold text-blue-600">{currentModel?.performance.trainingProgress}%</span>
                        </div>
                        <Progress 
                          value={currentModel?.performance.trainingProgress} 
                          className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">📚 Examples:</span>
                          <span className="font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            {currentModel?.trainingData.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">🤖 Status:</span>
                          <span className={`font-bold px-3 py-1 rounded-full ${
                            currentModel?.isTrained ? 'bg-green-100 text-green-700' : 
                            currentModel?.isTraining ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {currentModel?.isTrained ? '✅ Trained' : 
                             currentModel?.isTraining ? '🧠 Training...' : '⏳ Ready'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Model Performance */}
                    {currentModel?.isTrained && (
                      <motion.div 
                        className="bg-green-100/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-green-300"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="font-bold mb-4 text-green-800 flex items-center gap-2">
                          🏆 Performance Metrics
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">🎯 Accuracy:</span>
                            <span className="font-bold text-green-600 text-xl">{currentModel.performance.accuracy}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">�� Predictions:</span>
                            <span className="font-bold text-green-600">{currentModel.performance.predictions}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Training Controls */}
                  <div className="space-y-6">
                    <div className="bg-yellow-100/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-yellow-300">
                      <h3 className="font-bold mb-4 text-yellow-800 flex items-center gap-2">
                        💰 Training Cost
                      </h3>
                      <div className="space-y-3">
                        <p className="text-yellow-700">
                          🪙 Training costs <span className="font-bold">{TRAINING_COST} credits</span>
                        </p>
                        <p className="text-yellow-700">
                          💎 You have <span className="font-bold text-green-600">{credits} credits</span>
                        </p>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1"
                        >
                          <Button
                            onClick={trainModel}
                            disabled={currentModel?.isTraining || currentModel?.isTrained || credits < TRAINING_COST}
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg"
                          >
                            {currentModel?.isTraining ? (
                              <>
                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                🧠 Training...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                🚀 Start Training!
                              </>
                            )}
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={resetModel}
                            variant="outline"
                            disabled={currentModel?.isTraining}
                            className="bg-white hover:bg-gray-50 border-2 border-gray-300 px-4 py-3 rounded-xl"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {currentModel?.isTrained && (
                      <motion.div 
                        className="bg-green-100/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-green-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <h3 className="font-bold text-green-800">🎉 Training Complete!</h3>
                        </div>
                        <p className="text-green-700 mb-4">
                          🎊 Awesome! Your AI is ready to make predictions. Let's test it out and see the magic happen!
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            onClick={() => setCurrentStep('test')}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg"
                          >
                            🎯 Test Your AI! <ArrowRight className="h-6 w-6 ml-2" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-kid-pink to-kid-yellow p-8 rounded-3xl shadow-xl border-4 border-white/30">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 flex items-center justify-center gap-3">
                  <Target className="h-8 w-8 text-pink-600 animate-bounce" />
                  Test Your {currentModel?.name}
                </h2>

                {!currentModel?.isTrained ? (
                  <div className="text-center py-16">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <AlertCircle className="h-20 w-20 text-yellow-500 mx-auto mb-6 animate-bounce" />
                      <h3 className="text-2xl font-bold mb-4 text-gray-800">🚨 Oops! Model Not Trained Yet</h3>
                      <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                        Your AI buddy needs to learn first before it can make predictions! Let's go train it! 🧠✨
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={() => setCurrentStep('train')}
                          size="lg"
                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg text-xl"
                        >
                          🚀 Go to Training
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Input Section */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                      <label className="block text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                        ✍️ Enter text for your AI to analyze:
                      </label>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          className="flex-1 p-4 border-3 border-blue-200 rounded-xl text-lg bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-200 transition-all"
                          placeholder={
                            currentModel.type === 'text-classifier' ? '🌟 Try: "I love this amazing game!"' :
                            currentModel.type === 'sentiment-analyzer' ? '🎭 Try: "This is the best day ever!"' :
                            '🔮 Try: "1, 3, 5, 7,?"'
                          }
                          onKeyPress={(e) => e.key === 'Enter' && makePrediction()}
                        />
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={makePrediction}
                            disabled={isLoading || !userInput.trim() || credits < PREDICTION_COST}
                            size="lg"
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg"
                          >
                            {isLoading ? (
                              <>
                                <Brain className="h-5 w-5 mr-2 animate-pulse" />
                                🤔 Thinking...
                              </>
                            ) : (
                              <>
                                <Zap className="h-5 w-5 mr-2" />
                                🔮 Predict!
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 bg-blue-50 rounded-full py-2 px-4 inline-block">
                        💰 Cost: {PREDICTION_COST} credit per prediction
                      </p>
                    </div>

                    {/* Prediction Result */}
                    <AnimatePresence>
                      {prediction && (
                        <motion.div
                          initial={{ opacity: 0, y: 40, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="bg-gradient-to-r from-green-100 to-blue-100 p-8 rounded-3xl border-4 border-green-300 shadow-xl"
                        >
                          <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center gap-3">
                            <Award className="h-8 w-8 text-green-600" />
                            🎉 AI Prediction Result!
                          </h3>
                          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-700 text-lg">📝 Your Input:</span>
                                <span className="text-gray-800 text-lg bg-blue-100 px-4 py-2 rounded-full">"{userInput}"</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-700 text-lg">🤖 AI Says:</span>
                                <span className="text-green-600 font-bold text-2xl bg-green-100 px-6 py-3 rounded-full shadow-md">
                                  {prediction}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Model Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card className="p-6 text-center bg-gradient-to-br from-purple-100 to-pink-100 border-3 border-purple-300 rounded-2xl shadow-lg">
                          <div className="text-4xl font-bold text-purple-600 mb-2">
                            {currentModel.performance.accuracy}%
                          </div>
                          <div className="text-sm text-purple-700 font-semibold">🎯 Accuracy</div>
                        </Card>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card className="p-6 text-center bg-gradient-to-br from-blue-100 to-cyan-100 border-3 border-blue-300 rounded-2xl shadow-lg">
                          <div className="text-4xl font-bold text-blue-600 mb-2">
                            {currentModel.performance.predictions}
                          </div>
                          <div className="text-sm text-blue-700 font-semibold">�� Predictions Made</div>
                        </Card>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card className="p-6 text-center bg-gradient-to-br from-green-100 to-emerald-100 border-3 border-green-300 rounded-2xl shadow-lg">
                          <div className="text-4xl font-bold text-green-600 mb-2">
                            {currentModel.trainingData.length}
                          </div>
                          <div className="text-sm text-green-700 font-semibold">📚 Training Examples</div>
                        </Card>
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AITrainerPage; 