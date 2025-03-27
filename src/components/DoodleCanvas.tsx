
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface DoodleCanvasProps {
  onDoodleComplete: (imageDataUrl: string, doodleName: string) => void;
}

const DoodleCanvas = ({ onDoodleComplete }: DoodleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [canUndo, setCanUndo] = useState(false);
  const [canClear, setCanClear] = useState(false);
  const [doodleName, setDoodleName] = useState('');
  const historyRef = useRef<ImageData[]>([]);
  const currentStepRef = useRef(-1);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up the canvas for high-resolution drawing
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    // Set up the canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Update canvas dimensions considering device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale context according to device pixel ratio
    context.scale(dpr, dpr);
    
    // Set default styles
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    
    // Store the context for later use
    contextRef.current = context;
    
    // Clear the canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    saveState();
  }, []);

  // Update context when color or line width changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  const saveState = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    // Get current canvas state
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // If we've gone back in history and drawn something new,
    // we need to remove all future states
    if (currentStepRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, currentStepRef.current + 1);
    }
    
    // Add new state to history
    historyRef.current.push(imageData);
    currentStepRef.current = historyRef.current.length - 1;
    
    // Update undo/clear state
    setCanUndo(currentStepRef.current > 0);
    setCanClear(currentStepRef.current >= 0);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Start a new path
    context.beginPath();
    context.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Continue the path and draw
    context.lineTo(clientX - rect.left, clientY - rect.top);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const context = contextRef.current;
      if (context) {
        context.closePath();
        saveState();
      }
      setIsDrawing(false);
    }
  };

  const undo = () => {
    if (currentStepRef.current <= 0) return;
    
    currentStepRef.current--;
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    context.putImageData(historyRef.current[currentStepRef.current], 0, 0);
    
    // Update undo/clear state
    setCanUndo(currentStepRef.current > 0);
    setCanClear(currentStepRef.current >= 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    // Clear the canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    saveState();
    toast("Canvas cleared!");
  };

  const handleComplete = () => {
    if (!doodleName.trim()) {
      toast.error("Please name your doodle first!");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get data URL from canvas
    const dataUrl = canvas.toDataURL('image/png');
    onDoodleComplete(dataUrl, doodleName);
    toast.success("Doodle saved!");
  };

  const colors = [
    { value: '#000000', label: 'Black' },
    { value: '#ff0000', label: 'Red' },
    { value: '#0000ff', label: 'Blue' },
    { value: '#00ff00', label: 'Green' },
    { value: '#ffff00', label: 'Yellow' },
    { value: '#ff00ff', label: 'Pink' },
    { value: '#ff8000', label: 'Orange' },
    { value: '#8000ff', label: 'Purple' }
  ];

  const brushSizes = [
    { value: 2, label: 'Small' },
    { value: 5, label: 'Medium' },
    { value: 10, label: 'Large' },
    { value: 20, label: 'Extra Large' }
  ];

  return (
    <div className="flex flex-col space-y-4">
      <div className="mb-4">
        <Label htmlFor="doodle-name" className="mb-2 block">Name your doodle</Label>
        <Input
          id="doodle-name"
          placeholder="What are you drawing?"
          value={doodleName}
          onChange={(e) => setDoodleName(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center mb-2">
        {colors.map((colorOption) => (
          <button
            key={colorOption.value}
            className={`w-8 h-8 rounded-full transition-transform ${color === colorOption.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
            style={{ backgroundColor: colorOption.value }}
            onClick={() => setColor(colorOption.value)}
            aria-label={`Select ${colorOption.label} color`}
          />
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {brushSizes.map((size) => (
          <button
            key={size.value}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-transform ${lineWidth === size.value ? 'bg-muted ring-2 ring-primary scale-110' : 'bg-background hover:bg-muted hover:scale-105'}`}
            onClick={() => setLineWidth(size.value)}
            aria-label={`Select ${size.label} brush size`}
          >
            <div 
              className="rounded-full bg-foreground" 
              style={{ 
                width: `${Math.min(size.value, 16)}px`, 
                height: `${Math.min(size.value, 16)}px` 
              }} 
            />
          </button>
        ))}
      </div>
      
      <div className="relative border rounded-xl border-border overflow-hidden shadow-md bg-white w-full aspect-video mx-auto mb-4">
        <canvas
          ref={canvasRef}
          className="canvas-container w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: 'none' }}
        />
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          variant="outline" 
          onClick={undo} 
          disabled={!canUndo}
          className="btn-bounce"
        >
          Undo
        </Button>
        <Button 
          variant="outline" 
          onClick={clearCanvas} 
          disabled={!canClear}
          className="btn-bounce"
        >
          Clear
        </Button>
        <Button 
          onClick={handleComplete}
          className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce"
        >
          Complete Doodle
        </Button>
      </div>
    </div>
  );
};

export default DoodleCanvas;
