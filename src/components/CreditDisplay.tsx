import React, { useState } from 'react';
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreditSystem } from '@/hooks/useCreditSystem';

type CreditDisplayProps = {
  className?: string;
  displayType?: 'compact' | 'full';
};

export const CreditDisplay = ({ 
  className, 
  displayType = 'compact' 
}: CreditDisplayProps) => {
  const { credits, isLoading } = useCreditSystem();
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [lastSeenCredits, setLastSeenCredits] = useState<number | null>(null);
  const [animatedValue, setAnimatedValue] = useState<number>(0);

  // Effect to handle credit change animations
  React.useEffect(() => {
    // Only animate if we have a previous value to compare
    if (lastSeenCredits !== null && credits !== lastSeenCredits) {
      setAnimatedValue(credits - lastSeenCredits);
      setShowAnimation(true);
      
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    setLastSeenCredits(credits);
  }, [credits, lastSeenCredits]);
  
  return (
    <div className={cn("relative", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-3 h-auto rounded-full border-2 border-amber-300/50 bg-amber-50/80 backdrop-blur-sm text-amber-700 hover:bg-amber-100 hover:border-amber-400 transition-all",
              displayType === 'compact' ? 'min-w-[70px]' : 'min-w-[100px]'
            )}
          >
            <Coins className="h-4 w-4 text-amber-500" />
            {isLoading ? (
              <div className="w-6 h-3 bg-amber-200 animate-pulse rounded-md"></div>
            ) : (
              <span className="font-semibold">{credits}</span>
            )}
            {displayType === 'full' && <span className="ml-1">Credits</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-72 p-0 border-2 border-amber-200 bg-amber-50/95 backdrop-blur-sm shadow-lg"
          align="end"
        >
          <div className="p-4 border-b border-amber-200/50">
            <h3 className="font-bold text-amber-800 text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Your Credits
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="bg-white/60 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-600">{credits}</div>
                <div className="text-xs text-amber-700/70">Available</div>
              </div>
              {/* In a real implementation, you'd have a lifetime total here */}
              <div className="bg-white/60 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">120</div>
                <div className="text-xs text-purple-700/70">Lifetime</div>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h4 className="text-sm font-medium text-amber-800 mb-3">How to Earn Credits</h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Complete activities and challenges
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Answer questions correctly
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Create and save your work
                  </li>
              </ul>
          </div>
          
          <div className="p-3 border-t border-amber-200/50 bg-white/30 text-center">
            <p className="text-xs text-gray-600">
              Earn credits by completing activities and challenges!
            </p>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Animated credit change indicator */}
      {showAnimation && (
        <div 
          className={cn(
            "absolute -top-6 right-0 font-bold text-sm animate-float-up",
            animatedValue > 0 ? "text-green-500" : "text-red-500"
          )}
        >
          {animatedValue > 0 ? '+' : '-'}{Math.abs(animatedValue)}
        </div>
      )}
    </div>
  );
}; 