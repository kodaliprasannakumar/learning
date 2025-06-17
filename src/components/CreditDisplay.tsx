
import React from 'react';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { Card } from '@/components/ui/card';
import { Coins, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const CreditDisplay: React.FC = () => {
  const { credits, loading } = useCreditSystem();

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-200 rounded-full animate-pulse" />
          <div className="w-16 h-6 bg-yellow-200 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="inline-block"
    >
      <Card className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 shadow-lg">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Coins className="h-8 w-8 text-yellow-600" />
          </motion.div>
          <div>
            <div className="text-2xl font-bold text-yellow-800">{credits}</div>
            <div className="text-sm text-yellow-700 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Magic Stars
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CreditDisplay;
