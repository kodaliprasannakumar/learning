import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import ImageWithFallback from './ImageWithFallback';
import { cn } from '@/lib/utils';
import { Sparkles, Wand2, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageProviderSelector from './ImageProviderSelector';
import { ImageProvider } from '@/services/imageGeneration';

// Types for our story elements
interface StoryElement {
  id: string;
  name: string;
  type: 'character' | 'setting' | 'object' | 'storyStyle' | 'imageStyle';
  image: string;
}

interface StoryGeneratorProps {
  onGenerateStory: (elements: StoryElement[], imageProvider: ImageProvider) => void;
}

const StoryGenerator = ({ onGenerateStory }: StoryGeneratorProps) => {
  const [selectedElements, setSelectedElements] = useState<StoryElement[]>([]);
  const [activeCategory, setActiveCategory] = useState<'character' | 'setting' | 'object' | 'storyStyle' | 'imageStyle'>('character');
  const [selectedImageProvider, setSelectedImageProvider] = useState<ImageProvider>(ImageProvider.AUTO);

  // Placeholder data for story elements
  const storyElements: Record<string, StoryElement[]> = {
    character: [
      { id: 'c1', name: 'Princess', type: 'character', image: '/images/princess.png' },
      { id: 'c2', name: 'Dragon', type: 'character', image: '/images/dragon.png' },
      { id: 'c3', name: 'Wizard', type: 'character', image: '/images/wizard.png' },
      { id: 'c4', name: 'Robot', type: 'character', image: '/images/robot.png' },
      { id: 'c5', name: 'Alien', type: 'character', image: '/images/alien.png' },
      { id: 'c6', name: 'Pirate', type: 'character', image: '/images/pirate.png' },
    ],
    setting: [
      { id: 's1', name: 'Castle', type: 'setting', image: '/images/castle.png' },
      { id: 's2', name: 'Forest', type: 'setting', image: '/images/forest.png' },
      { id: 's3', name: 'Space', type: 'setting', image: '/images/space.png' },
      { id: 's4', name: 'Ocean', type: 'setting', image: '/images/ocean.png' },
      { id: 's5', name: 'Mountain', type: 'setting', image: '/images/mountain.png' },
      { id: 's6', name: 'City', type: 'setting', image: '/images/city.png' },
    ],
    object: [
      { id: 'o1', name: 'Magic Wand', type: 'object', image: '/images/magic_wand.png' },
      { id: 'o2', name: 'Treasure Chest', type: 'object', image: '/images/treasure.png' },
      { id: 'o3', name: 'Flying Carpet', type: 'object', image: '/images/flying_carpet.png' },
      { id: 'o4', name: 'Time Machine', type: 'object', image: '/images/time_machine.png' },
      { id: 'o5', name: 'Enchanted Book', type: 'object', image: '/images/enchanted_book.png' },
      { id: 'o6', name: 'Mystery Box', type: 'object', image: '/images/mysterybox.png' },
    ],
    storyStyle: [
      { id: 'ss1', name: 'Fun', type: 'storyStyle', image: '/images/fun_style.png' },
      { id: 'ss2', name: 'Adventure', type: 'storyStyle', image: '/images/adventure_style.png' },
      { id: 'ss3', name: 'Comedy', type: 'storyStyle', image: '/images/comedy_style.png' },
      { id: 'ss4', name: 'Educational', type: 'storyStyle', image: '/images/educational_style.png' },
      { id: 'ss5', name: 'Mystery', type: 'storyStyle', image: '/images/mystery_style.png' },
    ],
    imageStyle: [
      { id: 'is1', name: 'Cartoon', type: 'imageStyle', image: '/images/cartoon_style.png' },
      { id: 'is2', name: 'Watercolor', type: 'imageStyle', image: '/images/watercolor_style.png' },
      { id: 'is3', name: 'Pixel Art', type: 'imageStyle', image: '/images/pixel_art_style.png' },
      { id: 'is5', name: 'Comic Book', type: 'imageStyle', image: '/images/comic_style.png' },
      { id: 'is6', name: 'Digital Art', type: 'imageStyle', image: '/images/digital_art_style.png' },
      { id: 'is7', name: '3D Render', type: 'imageStyle', image: '/images/3d_render_style.png' },
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
    const randomStoryStyle = storyElements.storyStyle[Math.floor(Math.random() * storyElements.storyStyle.length)];
    const randomImageStyle = storyElements.imageStyle[Math.floor(Math.random() * storyElements.imageStyle.length)];
    
    setSelectedElements([randomCharacter, randomSetting, randomObject, randomStoryStyle, randomImageStyle]);
    toast("Random elements selected!");
  };

  const handleGenerateStory = () => {
    const hasCharacter = selectedElements.some(e => e.type === 'character');
    const hasSetting = selectedElements.some(e => e.type === 'setting');
    const hasObject = selectedElements.some(e => e.type === 'object');
    
    if (!hasCharacter || !hasSetting || !hasObject) {
      toast.error("Please select at least one character, setting, and object!");
      return;
    }
    
    // If no styles are selected, use default styles
    let elements = [...selectedElements];
    
    if (!selectedElements.some(e => e.type === 'storyStyle')) {
      const defaultStoryStyle = storyElements.storyStyle[0];
      elements = [...elements, defaultStoryStyle];
    }
    
    if (!selectedElements.some(e => e.type === 'imageStyle')) {
      const defaultImageStyle = storyElements.imageStyle[0];
      elements = [...elements, defaultImageStyle];
    }
    
    // Pass both the story elements and the selected image provider
    onGenerateStory(elements, selectedImageProvider);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-amber-600">Story Elements</h3>
        <Button 
          variant="outline" 
          onClick={handleRandomize}
          className="rounded-xl border-2 border-amber-300 hover:bg-amber-50 btn-bounce flex gap-2 items-center"
        >
          <Wand2 className="h-4 w-4" />
          Randomize
        </Button>
      </div>
      
      {/* Selected Elements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['character', 'setting', 'object'].map((type) => {
          const selected = selectedElements.find(e => e.type === type);
          const colors = {
            character: 'amber-400',
            setting: 'kid-green',
            object: 'kid-purple'
          };
          const borderColor = colors[type as keyof typeof colors] || 'amber-200';
          
          return (
            <Card key={type} className={cn(
              "flex flex-col items-center p-4 transition-all duration-300 rounded-2xl",
              selected 
                ? `bg-white shadow-md border-4 border-${borderColor}/40` 
                : "border-4 border-dashed border-amber-200/50 bg-amber-50/50"
            )}>
              <h4 className="text-lg font-medium mb-2 capitalize text-amber-600">{type}</h4>
              {selected ? (
                <div className="w-full">
                  <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-xl border-2 border-amber-200">
                    <ImageWithFallback
                      src={selected.image}
                      fallbackSrc="/placeholder.svg"
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{selected.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveElement(selected.id)}
                      className="text-xs hover:bg-amber-50 text-amber-600"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center w-full h-32 bg-amber-50/80 rounded-xl cursor-pointer hover:bg-amber-100/80 transition-colors border-2 border-amber-100"
                  onClick={() => setActiveCategory(type as any)}
                >
                  <span className="text-amber-600">Select a {type}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {/* Style Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Story Style Dropdown */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg font-medium text-amber-600">Story Style</label>
          <Select 
            onValueChange={(value) => {
              const style = storyElements.storyStyle.find(s => s.id === value);
              if (style) {
                handleSelectElement(style);
              }
            }}
            value={selectedElements.find(e => e.type === 'storyStyle')?.id || ""}
          >
            <SelectTrigger className="bg-white border-2 border-amber-200 rounded-xl h-12">
              <SelectValue placeholder="Select a story style" />
            </SelectTrigger>
            <SelectContent className="border-2 border-amber-200 rounded-xl">
              {storyElements.storyStyle.map((style) => (
                <SelectItem key={style.id} value={style.id} className="cursor-pointer">
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Image Style Dropdown */}
        <div className="flex flex-col space-y-2">
          <label className="text-lg font-medium text-amber-600">Image Style</label>
          <Select
            onValueChange={(value) => {
              const style = storyElements.imageStyle.find(s => s.id === value);
              if (style) {
                handleSelectElement(style);
              }
            }}
            value={selectedElements.find(e => e.type === 'imageStyle')?.id || ""}
          >
            <SelectTrigger className="bg-white border-2 border-amber-200 rounded-xl h-12">
              <SelectValue placeholder="Select an image style" />
            </SelectTrigger>
            <SelectContent className="border-2 border-amber-200 rounded-xl">
              {storyElements.imageStyle.map((style) => (
                <SelectItem key={style.id} value={style.id} className="cursor-pointer">
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Category Tabs - only show for main elements */}
      <div className="flex border-b-4 border-amber-200">
        {['character', 'setting', 'object'].map((category) => {
          const displayName = {
            character: 'Characters',
            setting: 'Settings',
            object: 'Objects',
          }[category];
          
          return (
            <button
              key={category}
              className={cn(
                "flex-1 py-3 px-4 text-center transition-colors border-b-4 -mb-1 rounded-t-xl font-medium",
                activeCategory === category 
                  ? "border-amber-500 text-amber-600 bg-amber-50" 
                  : "border-transparent text-muted-foreground hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50"
              )}
              onClick={() => setActiveCategory(category as any)}
            >
              {displayName}
            </button>
          );
        })}
      </div>
      
      {/* Element Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-amber-50/50 rounded-2xl border-2 border-amber-100">
        {storyElements[activeCategory].map((element) => {
          const isSelected = selectedElements.some(e => e.id === element.id);
          return (
            <Card 
              key={element.id} 
              className={cn(
                "overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-xl",
                isSelected ? "ring-4 ring-amber-400 shadow-lg border-amber-300" : "border-amber-200 shadow-sm hover:shadow-md"
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
              <div className="p-3 bg-white">
                <h4 className="font-medium text-center">{element.name}</h4>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Image Provider Selector */}
      <Card className="p-6 border-2 border-amber-200 bg-white rounded-xl mt-6">
        <ImageProviderSelector 
          value={selectedImageProvider}
          onChange={setSelectedImageProvider}
        />
      </Card>
      
      <div className="flex justify-center mt-6">
        <Button 
          className="bg-amber-500 hover:bg-amber-500/80 text-white rounded-xl border-2 border-amber-500 shadow-md btn-bounce px-8 py-6 text-lg flex gap-2 items-center"
          disabled={selectedElements.length < 3}
          onClick={handleGenerateStory}
        >
          <Sparkles className="h-5 w-5" />
          Generate Story
        </Button>
      </div>
    </div>
  );
};

export default StoryGenerator;
