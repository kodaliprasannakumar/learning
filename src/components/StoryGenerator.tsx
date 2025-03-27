
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import ImageWithFallback from './ImageWithFallback';
import { cn } from '@/lib/utils';

// Types for our story elements
interface StoryElement {
  id: string;
  name: string;
  type: 'character' | 'setting' | 'object';
  image: string;
}

interface StoryGeneratorProps {
  onGenerateStory: (elements: StoryElement[]) => void;
}

const StoryGenerator = ({ onGenerateStory }: StoryGeneratorProps) => {
  const [selectedElements, setSelectedElements] = useState<StoryElement[]>([]);
  const [activeCategory, setActiveCategory] = useState<'character' | 'setting' | 'object'>('character');

  // Placeholder data for story elements
  const storyElements: Record<string, StoryElement[]> = {
    character: [
      { id: 'c1', name: 'Princess', type: 'character', image: '/placeholder.svg' },
      { id: 'c2', name: 'Dragon', type: 'character', image: '/placeholder.svg' },
      { id: 'c3', name: 'Wizard', type: 'character', image: '/placeholder.svg' },
      { id: 'c4', name: 'Robot', type: 'character', image: '/placeholder.svg' },
      { id: 'c5', name: 'Alien', type: 'character', image: '/placeholder.svg' },
      { id: 'c6', name: 'Pirate', type: 'character', image: '/placeholder.svg' },
    ],
    setting: [
      { id: 's1', name: 'Castle', type: 'setting', image: '/placeholder.svg' },
      { id: 's2', name: 'Forest', type: 'setting', image: '/placeholder.svg' },
      { id: 's3', name: 'Space', type: 'setting', image: '/placeholder.svg' },
      { id: 's4', name: 'Ocean', type: 'setting', image: '/placeholder.svg' },
      { id: 's5', name: 'Mountain', type: 'setting', image: '/placeholder.svg' },
      { id: 's6', name: 'City', type: 'setting', image: '/placeholder.svg' },
    ],
    object: [
      { id: 'o1', name: 'Magic Wand', type: 'object', image: '/placeholder.svg' },
      { id: 'o2', name: 'Treasure Chest', type: 'object', image: '/placeholder.svg' },
      { id: 'o3', name: 'Flying Carpet', type: 'object', image: '/placeholder.svg' },
      { id: 'o4', name: 'Time Machine', type: 'object', image: '/placeholder.svg' },
      { id: 'o5', name: 'Enchanted Book', type: 'object', image: '/placeholder.svg' },
      { id: 'o6', name: 'Mystery Box', type: 'object', image: '/placeholder.svg' },
    ],
  };

  const handleSelectElement = (element: StoryElement) => {
    // Check if this element type is already selected
    const existingIndex = selectedElements.findIndex(e => e.type === element.type);
    
    if (existingIndex >= 0) {
      // Replace the existing element of the same type
      const newElements = [...selectedElements];
      newElements[existingIndex] = element;
      setSelectedElements(newElements);
    } else {
      // Add the new element
      setSelectedElements([...selectedElements, element]);
    }
    
    toast(`Added ${element.name} to your story!`);
    
    // Automatically move to the next category if not all are filled
    if (selectedElements.length < 2) {
      if (activeCategory === 'character') setActiveCategory('setting');
      else if (activeCategory === 'setting') setActiveCategory('object');
    }
  };

  const handleRemoveElement = (elementId: string) => {
    setSelectedElements(selectedElements.filter(e => e.id !== elementId));
  };

  const handleRandomize = () => {
    const randomCharacter = storyElements.character[Math.floor(Math.random() * storyElements.character.length)];
    const randomSetting = storyElements.setting[Math.floor(Math.random() * storyElements.setting.length)];
    const randomObject = storyElements.object[Math.floor(Math.random() * storyElements.object.length)];
    
    setSelectedElements([randomCharacter, randomSetting, randomObject]);
    toast("Random elements selected!");
  };

  const handleGenerateStory = () => {
    if (selectedElements.length < 3) {
      toast.error("Please select at least one character, setting, and object!");
      return;
    }
    
    onGenerateStory(selectedElements);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Story Elements</h3>
        <Button 
          variant="outline" 
          onClick={handleRandomize}
          className="btn-bounce"
        >
          Randomize
        </Button>
      </div>
      
      {/* Selected Elements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['character', 'setting', 'object'].map((type) => {
          const selected = selectedElements.find(e => e.type === type);
          return (
            <Card key={type} className={cn(
              "flex flex-col items-center p-4 transition-all duration-300",
              selected ? "glass-card shadow-md" : "border-dashed"
            )}>
              <h4 className="text-lg font-medium mb-2 capitalize">{type}</h4>
              {selected ? (
                <div className="w-full">
                  <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-md">
                    <ImageWithFallback
                      src={selected.image}
                      fallbackSrc="/placeholder.svg"
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{selected.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveElement(selected.id)}
                      className="text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center w-full h-32 bg-muted/50 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveCategory(type as any)}
                >
                  <span className="text-muted-foreground">Select a {type}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {/* Category Tabs */}
      <div className="flex border-b">
        {['character', 'setting', 'object'].map((category) => (
          <button
            key={category}
            className={cn(
              "flex-1 py-2 px-4 text-center transition-colors border-b-2",
              activeCategory === category 
                ? "border-primary text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            )}
            onClick={() => setActiveCategory(category as any)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}s
          </button>
        ))}
      </div>
      
      {/* Element Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {storyElements[activeCategory].map((element) => {
          const isSelected = selectedElements.some(e => e.id === element.id);
          return (
            <Card 
              key={element.id} 
              className={cn(
                "overflow-hidden cursor-pointer transition-all duration-300 card-hover",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => handleSelectElement(element)}
            >
              <div className="relative aspect-square">
                <ImageWithFallback
                  src={element.image}
                  fallbackSrc="/placeholder.svg"
                  alt={element.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h4 className="font-medium text-center">{element.name}</h4>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="flex justify-center mt-6">
        <Button 
          className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce px-8"
          disabled={selectedElements.length < 3}
          onClick={handleGenerateStory}
        >
          Generate Story
        </Button>
      </div>
    </div>
  );
};

export default StoryGenerator;
