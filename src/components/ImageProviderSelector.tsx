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
          <p><strong>Stable Diffusion:</strong> Fast image generation without rate limits, perfect for multiple concurrent sessions.</p>
        </div>
      )}
      
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as ImageProvider)}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50">
          <RadioGroupItem value={ImageProvider.STABILITY} id="stability" />
          <Label htmlFor="stability" className="flex-grow cursor-pointer">
            <div className="font-medium">Stable Diffusion</div>
            <div className="text-sm text-muted-foreground">Fast image generation without rate limits</div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ImageProviderSelector; 