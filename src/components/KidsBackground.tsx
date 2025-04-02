import React from 'react';

const KidsBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Notebook paper background */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute inset-0 w-full h-full" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(220, 220, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(220, 220, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}></div>
        <div className="absolute left-0 top-0 bottom-0 w-[1.5rem] bg-pink-100/30"></div>
      </div>

      {/* Background content wrapper - adds padding to push content below navbar */}
      <div className="absolute inset-0 pt-24 px-6">
        {/* Animated doodles - repositioned */}
        <svg className="absolute top-[25%] left-[20%] w-20 h-20 opacity-60 animate-bounce-light" style={{ animationDelay: "0.3s" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="1.5">
          <path d="M12 3v1m0 16v1m-9-9h1m16 0h1m-1.7-6.3L18 6m-11.3-.3L5.3 7.2m13.4 9.9l-1.4-1.4M6.3 17.7L5 19" strokeLinecap="round" />
          <circle cx="12" cy="12" r="5" />
        </svg>
        
        <svg className="absolute bottom-[30%] right-[20%] w-20 h-20 opacity-60 animate-bounce-light" style={{ animationDelay: "1.5s" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="1.5">
          <path d="M12 17.8l-6-3v-6l6-3 6 3v6l-6 3z" />
          <path d="M12 5.8v6l6 3" />
          <path d="M12 11.8l-6 3" />
        </svg>
        
        <svg className="absolute top-[40%] left-[15%] w-16 h-16 opacity-60 animate-bounce-light" style={{ animationDelay: "0.8s" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFD166" strokeWidth="1.5">
          <path d="M12 5c1.5-2 3-3 5.5-3s4.5 1 4.5 4c0 2-1 3-2 4s-3 2-5 3-3.5 2-3.5 4c0 1.5 1 2.5 2.5 2.5 2 0 3.5-1.5 3.5-3m-10-1h6" strokeLinecap="round" />
        </svg>

        {/* Crayon scribbles - adjusted to be more visible in main content area */}
        <svg className="absolute top-[10%] left-0 w-full h-[80%] opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50,150 Q100,100 150,150 T250,150 T350,150 T450,50" stroke="#FF6B6B" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M70,50 Q120,100 170,50 T270,50 T370,50 T470,150" stroke="#4ECDC4" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M30,200 Q130,250 230,200 T330,200 T430,300" stroke="#FFD166" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M150,250 Q200,300 250,250 T350,250 T450,250" stroke="#C77DFF" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M250,300 Q300,350 350,300 T450,300 T550,300" stroke="#118AB2" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
        
        {/* Floating shapes - repositioned */}
        <div className="absolute top-[30%] left-[30%] w-24 h-24 rounded-full bg-kid-yellow opacity-70 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-[60%] left-[25%] w-16 h-16 rounded-star bg-kid-pink opacity-70 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] right-[15%] w-20 h-20 rounded-star bg-kid-green opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[20%] right-[25%] w-12 h-12 rounded-full bg-kid-purple opacity-70 animate-float" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Floating bubbles - repositioned */}
        <div className="absolute top-[20%] left-[40%] w-8 h-8 rounded-full bg-blue-200 opacity-80 animate-float shadow-inner" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-[50%] left-[10%] w-10 h-10 rounded-full bg-blue-100 opacity-80 animate-float shadow-inner" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute top-[35%] right-[30%] w-6 h-6 rounded-full bg-blue-300 opacity-80 animate-float shadow-inner" style={{ animationDelay: '2.1s' }}></div>
        <div className="absolute bottom-[40%] right-[10%] w-12 h-12 rounded-full bg-blue-50 opacity-80 animate-float shadow-inner" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-[25%] left-[35%] w-5 h-5 rounded-full bg-blue-200 opacity-80 animate-float shadow-inner" style={{ animationDelay: '1.7s' }}></div>

        {/* Pulsing stars - repositioned */}
        <div className="absolute top-[15%] left-[45%] w-3 h-3 bg-yellow-300 transform rotate-45 animate-pulse-soft" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-[55%] left-[70%] w-2 h-2 bg-yellow-400 transform rotate-45 animate-pulse-soft" style={{ animationDelay: '1.3s' }}></div>
        <div className="absolute top-[45%] right-[20%] w-4 h-4 bg-yellow-200 transform rotate-45 animate-pulse-soft" style={{ animationDelay: '0.7s' }}></div>
        <div className="absolute bottom-[30%] right-[40%] w-3 h-3 bg-yellow-300 transform rotate-45 animate-pulse-soft" style={{ animationDelay: '1.9s' }}></div>
        
        {/* Paper airplanes - repositioned */}
        <div className="absolute top-[25%] left-0 w-10 h-10 animate-fly-right" style={{ animationDelay: '0s' }}>
          <div className="w-full h-full bg-white opacity-80 transform rotate-45 skew-x-12 shadow-md"></div>
        </div>
        <div className="absolute top-[45%] right-0 w-8 h-8 animate-fly-left" style={{ animationDelay: '5s' }}>
          <div className="w-full h-full bg-white opacity-80 transform rotate-45 skew-x-12 shadow-md"></div>
        </div>
        
        {/* Curved lines - repositioned */}
        <div className="absolute top-[35%] left-[25%] w-64 h-64 rounded-full border-2 border-dashed border-pink-200 opacity-40 animate-spin-slow"></div>
        <div className="absolute bottom-[15%] right-[20%] w-40 h-40 rounded-full border-2 border-dotted border-blue-200 opacity-40 animate-spin-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Gradient overlay - reduce opacity to show more of the notebook texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-40"></div>
    </div>
  );
};

export default KidsBackground; 