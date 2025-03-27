
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  PaintBucket, 
  GridIcon, 
  Image as ImageIcon 
} from 'lucide-react';

type StyleOption = "realistic" | "cartoon" | "watercolor" | "pixel";

interface StyleSelectorProps {
  onStyleSelect: (style: StyleOption) => void;
  selectedStyle: StyleOption;
}

const StyleSelector = ({ onStyleSelect, selectedStyle }: StyleSelectorProps) => {
  const styles: Array<{
    id: StyleOption;
    name: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      id: "realistic",
      name: "Realistic",
      icon: <ImageIcon className="h-5 w-5" />,
      description: "Detailed and lifelike"
    },
    {
      id: "cartoon",
      name: "Cartoon",
      icon: <PaintBucket className="h-5 w-5" />,
      description: "Colorful with bold outlines"
    },
    {
      id: "watercolor",
      name: "Watercolor",
      icon: <Palette className="h-5 w-5" />,
      description: "Soft and dreamy"
    },
    {
      id: "pixel",
      name: "Pixel Art",
      icon: <GridIcon className="h-5 w-5" />,
      description: "Retro video game style"
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Choose Art Style</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {styles.map((style) => (
          <Button
            key={style.id}
            onClick={() => onStyleSelect(style.id)}
            variant={selectedStyle === style.id ? "default" : "outline"}
            className={`flex-col py-3 h-auto min-w-[90px] ${
              selectedStyle === style.id 
                ? "bg-kid-blue hover:bg-kid-blue/90 text-white" 
                : "hover:bg-muted/80"
            }`}
          >
            <div className="mb-1">{style.icon}</div>
            <span className="text-sm font-medium">{style.name}</span>
            <span className="text-xs opacity-80 mt-1">{style.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
