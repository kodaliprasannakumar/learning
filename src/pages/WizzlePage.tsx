import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Palette, 
  BookOpen, 
  Puzzle, 
  Lightbulb, 
  Globe, 
  ClipboardCheck, 
  Brain,
  Music,
  ArrowRight,
  Star,
  Heart,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

// Unified Wizzle Design System - Based on StoryPage patterns
const WizzlePage = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const activities = [
    {
      id: 'doodle',
      title: 'Doodle to Image',
      description: 'Transform your sketches into stunning artwork with AI magic',
      icon: Palette,
      path: '/doodle',
      color: 'from-cyan-500 via-blue-500 to-indigo-600',
      bgGradient: 'from-cyan-50 via-blue-50 to-indigo-100',
      delay: '0ms'
    },
    {
      id: 'story',
      title: 'Story Generator',
      description: 'Create enchanting tales with magical characters and adventures',
      icon: BookOpen,
      path: '/story',
      color: 'from-orange-400 via-amber-500 to-yellow-500',
      bgGradient: 'from-orange-50 via-amber-50 to-yellow-100',
      delay: '100ms'
    },
    {
      id: 'puzzle',
      title: 'Puzzle Challenge',
      description: 'Solve brain-teasing puzzles and unlock creative AI responses',
      icon: Puzzle,
      path: '/puzzle',
      color: 'from-violet-500 via-purple-500 to-fuchsia-600',
      bgGradient: 'from-violet-50 via-purple-50 to-fuchsia-100',
      delay: '200ms'
    },
    {
      id: 'quote',
      title: 'Daily Wisdom',
      description: 'Discover inspiring quotes and build your vocabulary',
      icon: Lightbulb,
      path: '/quote',
      color: 'from-emerald-400 via-teal-500 to-cyan-600',
      bgGradient: 'from-emerald-50 via-teal-50 to-cyan-100',
      delay: '300ms'
    },
    {
      id: 'space',
      title: 'Space Explorer',
      description: 'Journey through the cosmos and discover space mysteries',
      icon: Globe,
      path: '/space',
      color: 'from-indigo-600 via-purple-600 to-pink-600',
      bgGradient: 'from-indigo-50 via-purple-50 to-pink-100',
      delay: '400ms'
    },
    {
      id: 'quiz',
      title: 'Interactive Quiz',
      description: 'Test your knowledge and earn exciting rewards',
      icon: ClipboardCheck,
      path: '/quiz',
      color: 'from-lime-500 via-green-500 to-emerald-600',
      bgGradient: 'from-lime-50 via-green-50 to-emerald-100',
      delay: '500ms'
    },
    {
      id: 'ai-trainer',
      title: 'AI Trainer Academy',
      description: 'Learn AI by training your own intelligent models',
      icon: Brain,
      path: '/ai-trainer',
      color: 'from-rose-500 via-pink-500 to-purple-600',
      bgGradient: 'from-rose-50 via-pink-50 to-purple-100',
      delay: '550ms'
    },
    {
      id: 'music',
      title: 'Music Maker Studio',
      description: 'Create amazing music with AI assistance and virtual instruments',
      icon: Music,
      path: '/music',
      color: 'from-purple-500 via-indigo-500 to-blue-600',
      bgGradient: 'from-purple-50 via-indigo-50 to-blue-100',
      delay: '600ms'
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      {/* Hero Section - Consistent with StoryPage */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg">
              <Sparkles className="h-4 w-4" />
              <span>Welcome to Your Creative Universe</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-transparent bg-clip-text">
                Wizzle
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your wildest ideas into reality with our collection of 
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text"> AI-powered creative tools</span>. 
              Draw, write, learn, and explore in a safe, fun environment designed just for you!
            </p>

            <Button 
              className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-700 hover:via-purple-700 hover:to-cyan-700 text-white px-8 py-4 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Creating Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Activities Grid - Consistent Card Design */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 text-transparent bg-clip-text">
              Choose Your Adventure
            </h2>
            <p className="text-xl text-gray-600">
              Discover amazing tools that bring your creativity to life
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 100 }}
                  onMouseEnter={() => setHoveredCard(activity.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Link to={activity.path}>
                    <Card className={`group relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white/80 backdrop-blur-sm`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      <div className="relative p-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${activity.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-gray-900">
                          {activity.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center text-sm font-semibold bg-gradient-to-r from-gray-600 to-gray-700 text-transparent bg-clip-text">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Consistent Design */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Safe, Fun & Educational
            </h2>
            <p className="text-xl text-gray-600">
              Designed with care for young creators and their families
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 100 }}
                >
                  <div className={`w-20 h-20 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`h-10 w-10 ${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WizzlePage;
