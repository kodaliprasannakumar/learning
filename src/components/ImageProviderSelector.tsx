import { useState } from 'react';
import { ImageProvider } from '@/services/imageGeneration';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface ImageProviderSelectorProps {
  value: ImageProvider;
  onChange: (provider: ImageProvider) => void;
}

const ImageProviderSelector = ({ value, onChange }: ImageProviderSelectorProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Image Provider</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-full"
          onClick={() => setShowInfo(!showInfo)}
          aria-label="Show information about image providers"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
      
      {showInfo && (
        <div className="bg-blue-50 p-4 rounded-md text-sm space-y-2 text-blue-800 mb-4">
          <p><strong>Auto:</strong> Automatically selects the best provider based on availability and rate limits.</p>
          <p><strong>DALL-E:</strong> OpenAI's model. Limited to 5 images per minute across all users.</p>
          <p><strong>Stable Diffusion:</strong> Alternative model without the same rate limits, good for multiple concurrent sessions.</p>
        </div>
      )}
      
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as ImageProvider)}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50">
          <RadioGroupItem value={ImageProvider.AUTO} id="auto" />
          <Label htmlFor="auto" className="flex-grow cursor-pointer">
            <div className="font-medium">Auto (Recommended)</div>
            <div className="text-sm text-muted-foreground">Selects the best provider based on availability</div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50">
          <RadioGroupItem value={ImageProvider.DALLE} id="dalle" />
          <Label htmlFor="dalle" className="flex-grow cursor-pointer">
            <div className="font-medium">DALL-E 3</div>
            <div className="text-sm text-muted-foreground">High quality but limited to 5 images per minute</div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50">
          <RadioGroupItem value={ImageProvider.STABILITY} id="stability" />
          <Label htmlFor="stability" className="flex-grow cursor-pointer">
            <div className="font-medium">Stable Diffusion</div>
            <div className="text-sm text-muted-foreground">No rate limits, good for multiple sessions</div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ImageProviderSelector; 