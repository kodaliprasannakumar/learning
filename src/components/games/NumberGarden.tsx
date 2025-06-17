import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const NumberGarden: React.FC = () => {
  return (
    <Card className="p-6 text-center">
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
          🌱
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Number Garden Game</h2>
        <p className="text-gray-600">
          Math garden game component - extracted from Math.tsx for better modularity
        </p>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-600">
          Start Game (Coming Soon)
        </Button>
      </div>
    </Card>
  );
}; 