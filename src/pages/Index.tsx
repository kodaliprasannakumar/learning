import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SavedDoodles from "@/components/SavedDoodles";
import { useState, useEffect } from "react";
import { 
  Video, 
  BookOpen, 
  Puzzle, 
  Shield, 
  Star, 
  Lightbulb, 
  Globe, 
  ClipboardCheck, 
  Brain,
  Sparkles,
  Heart,
  Play,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Music
} from "lucide-react";
import { WizzleCard, WizzleHeader } from "@/components/ui/WizzleCard";

export default function Index() {
  const { user, loading } = useAuth();
  const [animationPhase, setAnimationPhase] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hero images for slideshow
  const heroImages = [
    { src: "/images/hero/pic1.png", alt: "AI Generated Art 1" },
    { src: "/images/hero/pic2.png", alt: "AI Generated Art 2" },
    { src: "/images/hero/pic3.png", alt: "AI Generated Art 3" },
    { src: "/images/hero/pic4.png", alt: "AI Generated Art 4" },
    { src: "/images/hero/pic5.png", alt: "AI Generated Art 5" },
    { src: "/images/hero/pic6.png", alt: "AI Generated Art 6" },
  ];

  useEffect(() => {
    const phases = [
      { delay: 500, phase: 1 },   // Show "Imagination"
      { delay: 1500, phase: 2 },  // Show "Meets"
      { delay: 2200, phase: 3 },  // Show "AI"
      { delay: 2900, phase: 4 },  // Show "Magic"
      { delay: 5000, phase: 0 },  // Reset and loop
    ];

    const timers = phases.map(({ delay, phase }) =>
      setTimeout(() => setAnimationPhase(phase), delay)
    );

    const loopTimer = setInterval(() => {
      setAnimationPhase(0);
      phases.forEach(({ delay, phase }) => {
        setTimeout(() => setAnimationPhase(phase), delay);
      });
    }, 6000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loopTimer);
    };
  }, []);

  // Slideshow effect
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(slideTimer);
  }, [heroImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const scrollToActivities = () => {
    const activitiesSection = document.getElementById('activities-section');
    if (activitiesSection) {
      activitiesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const activities = [
    {
      id: 'doodle',
      title: 'Doodle to Image',
      description: 'Transform your sketches into stunning artwork with AI magic',
      icon: Video,
      path: '/doodle',
      gradient: 'from-amber-500 via-orange-500 to-pink-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      id: 'story',
      title: 'Story Generator',
      description: 'Create enchanting tales with magical characters and adventures',
      icon: BookOpen,
      path: '/story',
      gradient: 'from-purple-500 via-blue-500 to-cyan-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'puzzle',
      title: 'Puzzle Challenge',
      description: 'Solve brain-teasing puzzles and unlock creative AI responses',
      icon: Puzzle,
      path: '/puzzle',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200'
    },
    {
      id: 'quote',
      title: 'Daily Wisdom',
      description: 'Discover inspiring quotes and build your vocabulary',
      icon: Lightbulb,
      path: '/quote',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'space',
      title: 'Space Explorer',
      description: 'Journey through the cosmos and discover space mysteries',
      icon: Globe,
      path: '/space',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      id: 'quiz',
      title: 'Interactive Quiz',
      description: 'Test your knowledge and earn exciting rewards',
      icon: ClipboardCheck,
      path: '/quiz',
      gradient: 'from-lime-500 via-green-500 to-emerald-500',
      bgColor: 'bg-lime-50',
      borderColor: 'border-lime-200'
    },
    {
      id: 'ai-trainer',
      title: 'AI Trainer Academy',
      description: 'Learn AI by training your own intelligent models',
      icon: Brain,
      path: '/ai-trainer',
      gradient: 'from-rose-500 via-pink-500 to-purple-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200'

    },
    {
      id: 'music',
      title: 'Music Maker Studio',
      description: 'Create amazing music with AI assistance and virtual instruments',
      icon: Music,
      path: '/music',
      gradient: 'from-purple-500 via-indigo-500 to-blue-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All content is carefully monitored and child-friendly',
      color: 'text-emerald-600',
      bg: 'bg-gradient-to-br from-emerald-100 to-teal-200'
    },
    {
      icon: Star,
      title: 'Creative Learning',
      description: 'Boost imagination through interactive storytelling',
      color: 'text-blue-600',
      bg: 'bg-gradient-to-br from-blue-100 to-cyan-200'
    },
    {
      icon: Heart,
      title: 'Parent Approved',
      description: 'Designed with educators for educational excellence',
      color: 'text-rose-600',
      bg: 'bg-gradient-to-br from-rose-100 to-pink-200'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Enhanced Background */}
      <section className="relative min-h-screen wizzle-hero-bg overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg wizzle-glow">
                  <Sparkles className="h-4 w-4" />
                  <span>Welcome to Your Creative Universe</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold mb-8">
                  <div className="overflow-hidden">
                    <span 
                      className={`bg-gradient-to-r from-amber-600 via-orange-600 to-pink-600 text-transparent leading-[1.2] bg-clip-text inline-block transform transition-all duration-1000 ease-out wizzle-text-glow ${
                        animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                      }`}
                    >
                      Imagination
                    </span>
                  </div>
                  <br />
                  <div className="flex gap-4 justify-center lg:justify-start">
                    <span 
                      className={`text-gray-800 inline-block transform transition-all duration-1000 ease-out ${
                        animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                      }`}
                      style={{ transitionDelay: '0.3s' }}
                    >
                      Meets
                    </span>
                    <span 
                      className={`text-gray-800 inline-block transform transition-all duration-1000 ease-out ${
                        animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                      }`}
                      style={{ transitionDelay: '0.6s' }}
                    >
                      AI
                    </span>
                    <span 
                      className={`text-gray-800 inline-block transform transition-all duration-1000 ease-out ${
                        animationPhase >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                      }`}
                      style={{ transitionDelay: '0.9s' }}
                    >
                      Magic
                    </span>
                  </div>
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Transform your wildest ideas into reality with our collection of 
                  <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text"> AI-powered creative tools</span>. 
                  Draw, write, learn, and explore in a safe, fun environment designed just for you!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                  <button 
                    onClick={scrollToActivities}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:via-orange-600 hover:to-pink-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 wizzle-glow"
                  >
                    <Play className="mr-2 h-5 w-5 inline" />
                    Start Creating Now
                  </button>
                  <button className="border-2 border-purple-200 hover:border-purple-300 px-8 py-4 text-lg rounded-xl text-gray-700 hover:bg-purple-50 transition-all duration-200">
                    Learn More
                    <ArrowRight className="ml-2 h-5 w-5 inline" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Image Slideshow */}
            <div className="relative">
              <WizzleCard className="p-8 wizzle-glow">
                <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden">
                  {/* Images */}
                  {heroImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                        index === currentImageIndex 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-0 scale-105'
                      }`}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover rounded-2xl"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  ))}

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentImageIndex 
                            ? 'bg-white shadow-lg scale-125' 
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Image Caption */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 font-medium">
                    ✨ Created with Wizzle AI Tools
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {heroImages[currentImageIndex].alt}
                  </p>
                </div>
              </WizzleCard>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Grid - Enhanced Background */}
      <section id="activities-section" className="py-16 relative">
        <div className="absolute inset-0 wizzle-section-bg-vibrant"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <WizzleHeader 
            title="Choose Your Adventure"
            subtitle="Discover amazing tools that bring your creativity to life"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {activities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <Link key={activity.id} to={activity.path}>
                  <WizzleCard className="group hover:scale-105 transition-transform duration-200 h-80 wizzle-hover-lift">
                    <div className="flex flex-col h-full p-6">
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 bg-gradient-to-br ${activity.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 wizzle-icon`}>
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-grow flex flex-col">
                        <h4 className="text-lg font-bold mb-2 text-gray-800 text-center">
                          {activity.title}
                        </h4>
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed text-center flex-grow">
                          {activity.description}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center text-sm font-semibold text-amber-600">
                          Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </WizzleCard>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Saved Doodles Section - Enhanced Background */}
      {user && !loading && (
        <section className="py-16 relative">
          <div className="absolute inset-0 wizzle-section-bg"></div>
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <WizzleHeader 
              title="Your Creative Journey"
              subtitle="Look at all the amazing things you've created!"
            />
            <WizzleCard className="mt-8 wizzle-glow">
              <SavedDoodles />
            </WizzleCard>
          </div>
        </section>
      )}

      {/* Features Section - Enhanced Background */}
      <section className="py-16 relative">
        <div className="absolute inset-0 wizzle-section-bg-vibrant"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <WizzleHeader 
            title="Safe, Fun & Educational"
            subtitle="Designed with care for young creators and their families"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <WizzleCard key={index} className="text-center group wizzle-hover-lift">
                  <div className={`w-20 h-20 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 wizzle-icon`}>
                    <IconComponent className={`h-10 w-10 ${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </WizzleCard>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
