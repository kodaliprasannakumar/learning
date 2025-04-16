import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eraser, Droplet, Palette, Copy, Download, Undo2, Trash2, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface DoodleCanvasProps {
  onDoodleComplete: (imageDataUrl: string) => void;
}

// Brush types
type BrushType = 'normal' | 'rainbow' | 'crayon' | 'eraser' | 'spray' | 'chalk';

const DoodleCanvas = ({ onDoodleComplete }: DoodleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [canUndo, setCanUndo] = useState(false);
  const [canClear, setCanClear] = useState(false);
  const [brushType, setBrushType] = useState<BrushType>('normal');
  
  const historyRef = useRef<ImageData[]>([]);
  const currentStepRef = useRef(-1);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const rainbowHueRef = useRef(0);
  
  // Rainbow brush effect
  const getRainbowColor = () => {
    rainbowHueRef.current = (rainbowHueRef.current + 1) % 360;
    return `hsl(${rainbowHueRef.current}, 100%, 50%)`;
  };

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
      contextRef.current.strokeStyle = brushType === 'eraser' ? '#ffffff' : color;
      contextRef.current.lineWidth = lineWidth;
      
      // Apply special brush settings
      if (brushType === 'crayon') {
        contextRef.current.shadowBlur = 1;
        contextRef.current.shadowColor = 'rgba(0,0,0,0.2)';
        contextRef.current.lineJoin = 'round';
      } else if (brushType === 'chalk') {
        contextRef.current.shadowBlur = 0;
        contextRef.current.globalAlpha = 0.8;
      } else {
        contextRef.current.shadowBlur = 0;
        contextRef.current.globalAlpha = 1;
      }
    }
  }, [color, lineWidth, brushType]);

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
    
    // Special brushes initial actions
    if (brushType === 'spray') {
      drawSpray(clientX - rect.left, clientY - rect.top);
    }
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
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Different brush behaviors
    if (brushType === 'rainbow') {
      context.strokeStyle = getRainbowColor();
    } else if (brushType === 'spray') {
      drawSpray(x, y);
      return;
    }
    
    // Continue the path and draw
    context.lineTo(x, y);
    context.stroke();
  };
  
  // Spray brush implementation
  const drawSpray = (x: number, y: number) => {
    const context = contextRef.current;
    if (!context) return;
    
    const density = lineWidth * 3;
    const radius = lineWidth * 2;
    
    for (let i = 0; i < density; i++) {
      const offsetX = (Math.random() - 0.5) * radius * 2;
      const offsetY = (Math.random() - 0.5) * radius * 2;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      
      if (distance <= radius) {
        context.beginPath();
        context.fillStyle = brushType === 'rainbow' ? getRainbowColor() : color;
        context.arc(x + offsetX, y + offsetY, 0.5, 0, Math.PI * 2);
        context.fill();
      }
    }
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
    
    // Clear the canvas with white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    saveState();
    toast("Canvas cleared!");
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get data URL from canvas
    const dataUrl = canvas.toDataURL('image/png');
    onDoodleComplete(dataUrl);
    toast.success("Doodle saved!");
  };
  
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'doodle.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Doodle downloaded!");
  };

  const colors = [
    { value: '#000000', label: 'Black' },
    { value: '#ff0000', label: 'Red' },
    { value: '#33C3F0', label: 'Kid Blue' },
    { value: '#00ff00', label: 'Green' },
    { value: '#ffff00', label: 'Yellow' },
    { value: '#FFDEE2', label: 'Kid Pink' },
    { value: '#FEC6A1', label: 'Kid Orange' },
    { value: '#E5DEFF', label: 'Kid Purple' },
    { value: '#964B00', label: 'Brown' },
    { value: '#ffffff', label: 'White' }
  ];

  const brushSizes = [
    { value: 2, label: 'Small' },
    { value: 5, label: 'Medium' },
    { value: 10, label: 'Large' },
    { value: 20, label: 'Extra Large' }
  ];
  
  const brushTypes = [
    { value: 'normal', label: 'Normal', icon: <Droplet className="h-4 w-4" /> },
    { value: 'rainbow', label: 'Rainbow', icon: <Palette className="h-4 w-4" /> },
    { value: 'crayon', label: 'Crayon', icon: <Copy className="h-4 w-4" /> },
    { value: 'spray', label: 'Spray', icon: <span className="text-lg">⚬</span> },
    { value: 'chalk', label: 'Chalk', icon: <span className="text-lg">•</span> },
    { value: 'eraser', label: 'Eraser', icon: <Eraser className="h-4 w-4" /> }
  ] as const;

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <Card className="p-6 border-4 border-kid-blue/20 bg-gradient-to-br from-kid-blue/5 to-indigo-50 rounded-2xl shadow-lg">
        <div className="mb-5">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-white/80 rounded-xl">
              <TabsTrigger 
                value="colors" 
                className="rounded-lg data-[state=active]:bg-kid-blue data-[state=active]:text-white py-2"
              >
                <Palette className="h-4 w-4 mr-2" />
                Colors
              </TabsTrigger>
              <TabsTrigger 
                value="brushes" 
                className="rounded-lg data-[state=active]:bg-kid-pink data-[state=active]:text-black py-2"
              >
                <Droplet className="h-4 w-4 mr-2" />
                Brushes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="colors" className="py-4">
              <div className="flex flex-wrap gap-3 justify-center">
                {colors.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    className={`w-14 h-14 rounded-full transition-all ${color === colorOption.value ? 'ring-4 ring-offset-2 ring-kid-blue' : 'hover:scale-110'}`}
                    style={{ 
                      backgroundColor: colorOption.value, 
                      border: colorOption.value === '#ffffff' ? '1px solid #e2e2e2' : 'none'
                    }}
                    onClick={() => setColor(colorOption.value)}
                    aria-label={`Select ${colorOption.label} color`}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="brushes" className="pt-4">
              <div className="space-y-5">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {brushTypes.map((type) => (
                    <button
                      key={type.value}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all 
                        ${brushType === type.value 
                          ? 'bg-kid-blue/20 ring-2 ring-kid-blue' 
                          : 'bg-white hover:bg-kid-blue/10'
                        }`}
                      onClick={() => setBrushType(type.value)}
                      aria-label={`Select ${type.label} brush`}
                    >
                      <div className="mb-2 bg-white p-2 rounded-lg shadow-sm">
                        {type.icon}
                      </div>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                  {brushSizes.map((size) => (
                    <button
                      key={size.value}
                      className={`flex flex-col items-center justify-center space-y-1 transition-all`}
                      onClick={() => setLineWidth(size.value)}
                      aria-label={`Select ${size.label} brush size`}
                    >
                      <div 
                        className={`flex items-center justify-center w-14 h-14 rounded-full bg-white
                          ${lineWidth === size.value 
                            ? 'ring-2 ring-kid-blue shadow-md' 
                            : 'hover:bg-kid-blue/5'
                          }`}
                      >
                        <div 
                          className="rounded-full bg-foreground" 
                          style={{ 
                            width: `${size.value}px`, 
                            height: `${size.value}px` 
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium">{size.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
      
      <div className="relative overflow-hidden rounded-2xl bg-white border-4 border-kid-blue/20 shadow-lg">
        <canvas
          ref={canvasRef}
          width={1500}
          height={1000}
          className="w-full h-[40rem] md:h-[45rem] touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ backgroundColor: '#ffffff' }}
        />
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={undo} 
          disabled={!canUndo}
          variant="outline"
          size="lg"
          className="min-w-[120px] h-12 flex items-center justify-center gap-2 border-2 border-kid-blue/40 hover:border-kid-blue rounded-xl disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          <Undo2 className="h-5 w-5" />
          <span className="font-medium">Undo</span>
        </Button>
        
        <Button 
          onClick={clearCanvas} 
          disabled={!canClear}
          variant="outline"
          size="lg"
          className="min-w-[120px] h-12 flex items-center justify-center gap-2 border-2 border-kid-orange/40 hover:border-kid-orange rounded-xl disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          <Trash2 className="h-5 w-5" />
          <span className="font-medium">Clear</span>
        </Button>
        
        <Button 
          onClick={downloadCanvas}
          variant="outline"
          size="lg"
          className="min-w-[120px] h-12 flex items-center justify-center gap-2 border-2 border-kid-green/40 hover:border-kid-green rounded-xl shadow-sm hover:shadow-md"
        >
          <Download className="h-5 w-5" />
          <span className="font-medium">Download</span>
        </Button>
        
        <Button 
          onClick={handleComplete}
          size="lg"
          className="min-w-[150px] h-12 flex items-center justify-center gap-2 bg-kid-blue hover:bg-kid-blue/80 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Complete</span>
        </Button>
      </div>
    </div>
  );
};

export default DoodleCanvas;