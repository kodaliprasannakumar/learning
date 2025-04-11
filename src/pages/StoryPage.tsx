import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StoryGenerator from '@/components/StoryGenerator';
import ImageWithFallback from '@/components/ImageWithFallback';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Book, BookOpen, Download, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { generateStory } from '@/integrations/openai';
import { speak, stopSpeaking, isSpeaking } from '@/lib/textToSpeech';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Types for our story elements
interface StoryElement {
  id: string;
  name: string;
  type: 'character' | 'setting' | 'object' | 'storyStyle' | 'imageStyle';
  image: string;
}

interface StoryPage {
  text: string;
  image: string;
}

const StoryPage = () => {
  const [selectedElements, setSelectedElements] = useState<StoryElement[]>([]);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyView, setStoryView] = useState<'list' | 'book'>('list');
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const stopSpeakingRef = useRef<(() => void) | null>(null);

  // Clean up speech when component unmounts
  useEffect(() => {
    return () => {
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
      }
    };
  }, []);

  // Handle page change for book view
  useEffect(() => {
    if (storyView === 'book' && isReading) {
      // Stop any ongoing speech
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
      }
      
      // Start reading the new page
      readCurrentPage();
    }
  }, [currentPage, storyView]);

  const handleGenerateStory = async (elements: StoryElement[]) => {
    setSelectedElements(elements);
    setIsGenerating(true);
    setError(null);
    
    try {
      // Use the OpenAI API to generate the story
      const generatedStory = await generateStory(elements);
      
      setStoryPages(generatedStory);
      setCurrentPage(0);
      toast.success("Your story has been created!");
    } catch (err) {
      console.error("Error generating story:", err);
      setError("Failed to generate story. Please try again.");
      toast.error("Failed to generate story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewStory = () => {
    setSelectedElements([]);
    setStoryPages([]);
    setError(null);
    
    // Stop any ongoing speech
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      setIsReading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < storyPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const readCurrentPage = () => {
    if (storyPages.length === 0 || currentPage >= storyPages.length) return;
    
    // Stop any ongoing speech
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
    }
    
    // Get the text of the current page
    const text = storyPages[currentPage].text;
    
    // Start speaking
    setIsReading(true);
    stopSpeakingRef.current = speak(text, () => {
      setIsReading(false);
      
      // Auto-advance to next page if in book view
      if (storyView === 'book' && currentPage < storyPages.length - 1) {
        setTimeout(() => {
          setCurrentPage(currentPage + 1);
        }, 500);
      }
    }, (error) => {
      console.error('Speech error:', error);
      setIsReading(false);
      toast.error('Could not read the story. Please try again.');
    });
  };

  const toggleReading = () => {
    if (isReading) {
      // Stop reading
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
        setIsReading(false);
      }
    } else {
      // Start reading
      readCurrentPage();
    }
  };

  const handleDownloadStory = async () => {
    if (storyPages.length === 0) return;
    
    setIsDownloading(true);
    toast.info("Preparing your story for download...");
    
    try {
      // Create a new PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Get character, setting, and object names for the title
      const character = selectedElements.find(e => e.type === 'character')?.name || 'Hero';
      const setting = selectedElements.find(e => e.type === 'setting')?.name || 'Kingdom';
      const object = selectedElements.find(e => e.type === 'object')?.name || 'Treasure';
      
      // Add a title page
      pdf.setFontSize(24);
      pdf.setTextColor(235, 137, 0); // amber-600 color
      pdf.text("My Botadoodle Story", 105, 30, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text(`A tale of a ${character} in a ${setting} with a ${object}`, 105, 45, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Generated with Botadoodle", 105, 200, { align: 'center' });
      pdf.text(new Date().toLocaleDateString(), 105, 210, { align: 'center' });
      
      // Add each story page to the PDF
      for (let i = 0; i < storyPages.length; i++) {
        // Add a new page after the title page and between story pages
        pdf.addPage();
        
        // Add the page number
        pdf.setFontSize(12);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i + 1}`, 105, 15, { align: 'center' });
        
        // Create a temporary container for the image
        const imageContainer = document.createElement('div');
        imageContainer.style.width = '400px';
        imageContainer.style.height = '400px';
        imageContainer.style.overflow = 'hidden';
        imageContainer.style.position = 'fixed';
        imageContainer.style.top = '-1000px';
        imageContainer.style.left = '-1000px';
        
        // Create an image element
        const img = document.createElement('img');
        img.src = storyPages[i].image;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        
        // Append elements to the DOM
        imageContainer.appendChild(img);
        document.body.appendChild(imageContainer);
        
        // Wait for image to load
        await new Promise(resolve => {
          img.onload = resolve;
          setTimeout(resolve, 1000); // Fallback if onload doesn't trigger
        });
        
        // Convert the image to canvas
        try {
          const canvas = await html2canvas(imageContainer, { scale: 2 });
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          
          // Add the image to the PDF (centered)
          pdf.addImage(imgData, 'JPEG', 20, 25, 170, 130);
        } catch (err) {
          console.error("Error capturing image:", err);
        }
        
        // Clean up
        document.body.removeChild(imageContainer);
        
        // Add the story text
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        
        // Add text with word wrap
        const splitText = pdf.splitTextToSize(storyPages[i].text, 170);
        pdf.text(splitText, 20, 170);
      }
      
      // Save the PDF
      pdf.save("botadoodle-story.pdf");
      toast.success("Story downloaded successfully!");
    } catch (err) {
      console.error("Error downloading story:", err);
      toast.error("Failed to download story. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4 text-amber-600">Story Generator</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose characters, settings, and objects to create your own unique story!
        </p>
      </div>
      
      <Card className="border-4 border-amber-400/40 bg-gradient-to-br from-kid-yellow/30 to-white p-6 md:p-8 rounded-3xl shadow-xl animate-scale-in">
        {selectedElements.length === 0 || storyPages.length === 0 ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-center text-amber-600">Create Your Story</h2>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mb-6"></div>
                <p className="text-lg mb-2">Weaving your magical story...</p>
                <p className="text-md text-muted-foreground">Creating beautiful illustrations for each page</p>
                <div className="mt-4 flex space-x-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
                    <p>{error}</p>
                    <p className="text-sm mt-2">Tip: Make sure you have your OpenAI API key set as VITE_OPENAI_API_KEY in your environment.</p>
                  </div>
                )}
                <StoryGenerator onGenerateStory={handleGenerateStory} />
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-amber-600">Your Story</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-xl border-2 ${storyView === 'list' ? 'bg-amber-100 border-amber-300' : 'border-amber-200 hover:bg-amber-50'}`}
                  onClick={() => setStoryView('list')}
                >
                  <Book className="h-4 w-4 mr-1" />
                  List View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-xl border-2 ${storyView === 'book' ? 'bg-amber-100 border-amber-300' : 'border-amber-200 hover:bg-amber-50'}`}
                  onClick={() => setStoryView('book')}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Book View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-xl border-2 ${isReading ? 'bg-amber-100 border-amber-300' : 'border-amber-200 hover:bg-amber-50'}`}
                  onClick={toggleReading}
                >
                  {isReading ? (
                    <>
                      <VolumeX className="h-4 w-4 mr-1" />
                      Stop Reading
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-1" />
                      Read Story
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {storyView === 'list' ? (
              <div className="w-full space-y-6 mb-6">
                {storyPages.map((page, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl overflow-hidden shadow-md border-2 border-amber-200 animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="md:w-1/3 bg-amber-50">
                      <ImageWithFallback
                        src={page.image}
                        fallbackSrc="/placeholder.svg"
                        alt={`Story page ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-6 md:w-2/3">
                      <span className="text-amber-600 mb-2 font-medium">Page {index + 1}</span>
                      <p className="text-lg leading-relaxed">{page.text}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4 self-start text-amber-600 hover:bg-amber-50"
                        onClick={() => {
                          // Stop any ongoing speech
                          if (stopSpeakingRef.current) {
                            stopSpeakingRef.current();
                          }
                          
                          // Start reading this page
                          setIsReading(true);
                          stopSpeakingRef.current = speak(page.text, () => {
                            setIsReading(false);
                          });
                        }}
                      >
                        <Volume2 className="h-4 w-4 mr-1" />
                        Read This Page
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full mb-6">
                <div className="bg-white rounded-2xl overflow-hidden shadow-md border-2 border-amber-200 flex flex-col md:flex-row animate-scale-in">
                  <div className="md:w-1/2 aspect-square md:aspect-auto bg-amber-50">
                    <ImageWithFallback
                      src={storyPages[currentPage].image}
                      fallbackSrc="/placeholder.svg"
                      alt={`Story page ${currentPage + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-8 md:w-1/2">
                    <div>
                      <span className="text-amber-600 mb-4 block font-medium">
                        Page {currentPage + 1} of {storyPages.length}
                      </span>
                      <p className="text-xl mb-6">{storyPages[currentPage].text}</p>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button
                        variant="outline"
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        className="rounded-xl border-2 border-amber-200 hover:bg-amber-50 btn-bounce flex gap-2 items-center"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={toggleReading}
                        className="rounded-xl border-2 border-amber-200 hover:bg-amber-50 btn-bounce flex gap-2 items-center"
                      >
                        {isReading ? (
                          <>
                            <VolumeX className="h-4 w-4" />
                            Stop Reading
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-4 w-4" />
                            Read Page
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={currentPage === storyPages.length - 1}
                        className="rounded-xl border-2 border-amber-200 hover:bg-amber-50 btn-bounce flex gap-2 items-center"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                className="rounded-xl border-2 border-amber-300 hover:bg-amber-50"
                onClick={handleNewStory}
              >
                Create New Story
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-500/80 text-white rounded-xl border-2 border-amber-500 shadow-md btn-bounce"
                onClick={handleDownloadStory}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Story
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      <div className="mt-16 bg-gradient-to-br from-amber-100 to-kid-yellow/20 rounded-3xl p-6 md:p-8 border-4 border-amber-200/40 shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
        <h2 className="text-2xl font-semibold mb-4 text-center text-amber-600">Story Ideas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StoryIdea
            title="Space Adventure"
            elements={["Astronaut", "Space Station", "Alien Artifact"]}
          />
          <StoryIdea
            title="Enchanted Forest"
            elements={["Fairy", "Magical Forest", "Glowing Potion"]}
          />
          <StoryIdea
            title="Ocean Explorer"
            elements={["Mermaid", "Underwater City", "Treasure Chest"]}
          />
        </div>
      </div>
    </div>
  );
};

interface StoryIdeaProps {
  title: string;
  elements: string[];
}

const StoryIdea = ({ title, elements }: StoryIdeaProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-amber-200 shadow-md hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
      <h3 className="font-medium mb-3 text-amber-600">{title}</h3>
      <ul className="space-y-2">
        {elements.map((element, index) => (
          <li key={index} className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
            <span className="text-muted-foreground">{element}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StoryPage;
