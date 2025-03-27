
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StoryGenerator from '@/components/StoryGenerator';
import ImageWithFallback from '@/components/ImageWithFallback';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Book, BookOpen, Sparkles } from 'lucide-react';

// Types for our story elements
interface StoryElement {
  id: string;
  name: string;
  type: 'character' | 'setting' | 'object';
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

  const handleGenerateStory = (elements: StoryElement[]) => {
    setSelectedElements(elements);
    setIsGenerating(true);
    
    // Simulate story generation (in a real app, this would call an API)
    setTimeout(() => {
      const character = elements.find(e => e.type === 'character')?.name || 'Hero';
      const setting = elements.find(e => e.type === 'setting')?.name || 'Kingdom';
      const object = elements.find(e => e.type === 'object')?.name || 'Treasure';
      
      // Generate a simple story with 3 pages
      const generatedStory = [
        {
          text: `Once upon a time, there was a brave ${character} who lived in a beautiful ${setting}. Every day was an adventure filled with wonder and excitement.`,
          image: '/placeholder.svg'
        },
        {
          text: `One day, the ${character} discovered a mysterious ${object}. It seemed to glow with a magical energy that no one had ever seen before.`,
          image: '/placeholder.svg'
        },
        {
          text: `With the ${object} in hand, the ${character} embarked on an epic journey across the ${setting}, facing challenges and making new friends along the way.`,
          image: '/placeholder.svg'
        },
      ];
      
      setStoryPages(generatedStory);
      setIsGenerating(false);
      setCurrentPage(0);
      toast.success("Your story has been created!");
    }, 3000);
  };

  const handleNewStory = () => {
    setSelectedElements([]);
    setStoryPages([]);
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
                <p className="text-lg">Weaving your magical story...</p>
              </div>
            ) : (
              <StoryGenerator onGenerateStory={handleGenerateStory} />
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
                      <p className="text-lg">{page.text}</p>
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
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={handleNewStory}
                className="rounded-xl border-2 border-amber-300 hover:bg-amber-50 btn-bounce"
              >
                Create New Story
              </Button>
              <Button 
                className="bg-amber-500 hover:bg-amber-500/80 text-white rounded-xl border-2 border-amber-500 shadow-md btn-bounce flex gap-2 items-center"
                onClick={() => toast.success("Story saved successfully!")}
              >
                <Sparkles className="h-4 w-4" />
                Save Story
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
