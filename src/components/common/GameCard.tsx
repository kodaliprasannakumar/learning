import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { GameCategory } from '@/types';
import { UI_CONFIG, ANIMATION_DURATIONS } from '@/constants';

interface GameCardProps {
  game: GameCategory;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  icon: Icon,
  onClick,
  disabled = false,
  loading = false,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: ANIMATION_DURATIONS.FAST }}
      className={className}
    >
      <Card 
        className={`
          ${UI_CONFIG.CARD_PADDING}
          cursor-pointer transition-all duration-300 
          border-2 border-white/20 backdrop-blur-sm
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-white/40 hover:shadow-lg'
          }
          ${game.bgColor}
        `}
        onClick={disabled ? undefined : onClick}
      >
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className={`
            mx-auto w-16 h-16 rounded-full flex items-center justify-center
            bg-gradient-to-br ${game.color}
            shadow-lg transform transition-transform duration-300
            ${!disabled && 'group-hover:scale-110'}
          `}>
            <Icon className={`${UI_CONFIG.ICON_SIZES.LG} text-white`} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            {game.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">
            {game.description}
          </p>

          {/* Difficulty Badge */}
          <div className="flex justify-center items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`
                text-xs font-medium px-2 py-1
                ${game.difficulty.level === 'easy' ? 'bg-green-100 text-green-700' :
                  game.difficulty.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }
              `}
            >
              {game.difficulty.level.toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-500">
              {game.difficulty.minAge}-{game.difficulty.maxAge} years
            </span>
          </div>

          {/* Action Button */}
          <Button
            className={`
              w-full mt-4 font-semibold text-white border-0
              bg-gradient-to-r ${game.color}
              hover:opacity-90 transition-opacity duration-200
              ${UI_CONFIG.BUTTON_SIZES.MD}
            `}
            disabled={disabled || loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              'Play Now'
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}; 