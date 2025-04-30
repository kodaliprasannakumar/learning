import React from "react";
import { motion } from "framer-motion";

interface GenerationAnimationProps {
  style?: React.CSSProperties;
  mode: "image" | "story";
}

const GenerationAnimation: React.FC<GenerationAnimationProps> = ({ style, mode = "image" }) => {
  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 z-50 rounded-lg overflow-hidden p-8 shadow-[inset_0_0_40px_10px_rgba(0,0,0,0.5)]"
      style={style}
    >
      {/* Colorful swirls background */}
      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full border-[3px] border-kid-blue"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full border-[3px] border-kid-pink"
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full border-[3px] border-kid-purple"
          animate={{ 
            rotate: 360,
            scale: [1, 0.9, 1],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      </div>
      
      {/* Main animation container */}
      <div className="relative w-64 h-64 mb-6 flex items-center justify-center">
        {/* Central glow */}
        <motion.div 
          className="absolute w-20 h-20 bg-white rounded-full opacity-70 blur-xl"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.7, 0.9, 0.7]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Orbiting elements */}
        <motion.div 
          className="relative w-40 h-40"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <motion.div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        
        <motion.div 
          className="relative w-28 h-28"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <motion.div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
            animate={{ scale: [1, 0.8, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        
        <motion.div 
          className="relative w-56 h-56"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <motion.div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-7 bg-kid-pink rounded-full shadow-lg shadow-kid-pink/50"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        
        {/* Central white orb */}
        <motion.div 
          className="absolute w-16 h-16 bg-white rounded-full shadow-[0_0_20px_10px_rgba(255,255,255,0.3),0_0_5px_2px_rgba(255,255,255,0.8)]"
          animate={{ 
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 20px 10px rgba(255,255,255,0.3), 0 0 5px 2px rgba(255,255,255,0.8)",
              "0 0 25px 12px rgba(255,255,255,0.4), 0 0 8px 3px rgba(255,255,255,0.9)",
              "0 0 20px 10px rgba(255,255,255,0.3), 0 0 5px 2px rgba(255,255,255,0.8)"
            ]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Text */}
      <motion.div
        className="text-center z-10 mb-6 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-white mb-2 tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          {mode === "image" ? "Transforming Your Doodle" : "Creating Your Story"}
        </h3>
        <p className="text-gray-200 text-center max-w-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
          {mode === "image" 
            ? "Our AI is bringing your drawing to life with magical details and colors..." 
            : "Our AI is crafting a unique story based on your creation..."}
        </p>
      </motion.div>
      
      {/* Loading indicator dots */}
      <div className="flex space-x-3 mt-1">
        <motion.div 
          className="w-3 h-3 bg-kid-blue rounded-full shadow-md shadow-kid-blue/30"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.1 }}
        />
        <motion.div 
          className="w-3 h-3 bg-kid-pink rounded-full shadow-md shadow-kid-pink/30"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.1, delay: 0.15 }}
        />
        <motion.div 
          className="w-3 h-3 bg-kid-purple rounded-full shadow-md shadow-kid-purple/30"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.1, delay: 0.3 }}
        />
      </div>
    </div>
  );
};

export default GenerationAnimation; 