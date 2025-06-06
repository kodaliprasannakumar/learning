import { Button } from "@/components/ui/button";
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
  Palette, 
  Lightbulb, 
  Globe, 
  ClipboardCheck, 
  Brain,
  Sparkles,
  Rocket,
  Heart,
  Play,
  ArrowRight,
  Calculator,
  Clock
} from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();
  const [animationPhase, setAnimationPhase] = useState(0);

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
      color: 'blue',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
      bgGradient: 'from-cyan-50 via-blue-50 to-indigo-100',
      delay: '0ms'
    },
    {
      id: 'story',
      title: 'Story Generator',
      description: 'Create enchanting tales with magical characters and adventures',
      icon: BookOpen,
      path: '/story',
      color: 'amber',
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      bgGradient: 'from-orange-50 via-amber-50 to-yellow-100',
      delay: '100ms'
    },
    {
      id: 'puzzle',
      title: 'Puzzle Challenge',
      description: 'Solve brain-teasing puzzles and unlock creative AI responses',
      icon: Puzzle,
      path: '/puzzle',
      color: 'purple',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
      bgGradient: 'from-violet-50 via-purple-50 to-fuchsia-100',
      delay: '200ms'
    },
    {
      id: 'quote',
      title: 'Daily Wisdom',
      description: 'Discover inspiring quotes and build your vocabulary',
      icon: Lightbulb,
      path: '/quote',
      color: 'yellow',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      bgGradient: 'from-emerald-50 via-teal-50 to-cyan-100',
      delay: '300ms'
    },
    {
      id: 'space',
      title: 'Space Explorer',
      description: 'Journey through the cosmos and discover space mysteries',
      icon: Globe,
      path: '/space',
      color: 'indigo',
      gradient: 'from-indigo-600 via-purple-600 to-pink-600',
      bgGradient: 'from-indigo-50 via-purple-50 to-pink-100',
      delay: '400ms'
    },
    {
      id: 'quiz',
      title: 'Interactive Quiz',
      description: 'Test your knowledge and earn exciting rewards',
      icon: ClipboardCheck,
      path: '/quiz',
      color: 'green',
      gradient: 'from-lime-500 via-green-500 to-emerald-600',
      bgGradient: 'from-lime-50 via-green-50 to-emerald-100',
      delay: '500ms'
    },
    {
      id: 'math',
      title: 'Math Adventure',
      description: 'Explore magical number worlds and solve fun math challenges',
      icon: Calculator,
      path: '/math',
      color: 'orange',
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      bgGradient: 'from-orange-50 via-red-50 to-pink-100',
      delay: '550ms',
      comingSoon: true
    },
    {
      id: 'ai-trainer',
      title: 'AI Trainer Academy',
      description: 'Learn AI by training your own intelligent models',
      icon: Brain,
      path: '/ai-trainer',
      color: 'violet',
      gradient: 'from-rose-500 via-pink-500 to-purple-600',
      bgGradient: 'from-rose-50 via-pink-50 to-purple-100',
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
    <>
      {/* Hero Section - Extended to top */}
      <section className="relative h-[95vh] bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 overflow-hidden -mt-32 pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-500/10 to-cyan-500/10"></div>
        <div className="relative container mx-auto px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Floating Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
            <div className="absolute top-20 right-10 w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-br from-amber-400/25 to-orange-500/25 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
            <div className="absolute top-32 left-1/4 w-8 h-8 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-lg animate-pulse" style={{ animationDelay: '3s', animationDuration: '6s' }}></div>
            <div className="absolute bottom-32 right-1/4 w-14 h-14 bg-gradient-to-br from-violet-400/25 to-fuchsia-500/25 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}></div>

            {/* Main Hero Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-6 py-3 rounded-full text-sm font-medium mb-16 shadow-lg">
                <Sparkles className="h-4 w-4" />
                <span>Welcome to Your Creative Universe</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-16 ">
                <div className="overflow-hidden">
                  <span 
                    className={`bg-gradient-to-r from-pink-600 via-purple-600 via-blue-600 to-cyan-600 text-transparent leading-[1.2] bg-clip-text inline-block transform transition-all duration-1000 ease-out ${
                      animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    }`}
                  >
                    Imagination
                  </span>
                </div>
                <br />
                <div className="flex gap-4 justify-center">
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
              
              <p className="text-xl lg:text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed">
                Transform your wildest ideas into reality with our collection of 
                <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text"> AI-powered creative tools</span>. 
                Draw, write, learn, and explore in a safe, fun environment designed just for you!
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  onClick={scrollToActivities}
                  className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-700 hover:via-purple-700 hover:to-cyan-700 text-white px-8 py-6 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Creating Now
                </Button>
                <Button variant="outline" className="border-2 border-purple-200 hover:border-purple-300 px-8 py-6 text-lg rounded-full">
                  <span className="text-gray-700">Learn More</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <div className="bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
        <section id="activities-section" className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 text-transparent bg-clip-text">
              Choose Your Adventure
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing tools that bring your creativity to life
            </p>
          </div>

          {/* Activity Categories - Compact 4-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            
            {/* Create & Express Column */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-600 to-amber-600 text-transparent bg-clip-text">
                Create & Express
              </h3>
              {activities.slice(0, 2).map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="group relative animate-fade-in"
                    style={{ animationDelay: activity.delay }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${activity.bgGradient} rounded-2xl transform group-hover:scale-105 transition-transform duration-300`}></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                      {/* Icon */}
                      <div className="mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${activity.gradient} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="text-lg font-bold mb-2 text-gray-800">
                        {activity.title}
                      </h4>
                      <p className="text-gray-600 mb-4 leading-relaxed text-xs">
                        {activity.description}
                      </p>

                      {/* CTA Button */}
                      <Link to={activity.path}>
                        <Button className={`w-full bg-gradient-to-r ${activity.gradient} hover:opacity-90 text-white py-2 rounded-xl font-semibold transform group-hover:scale-105 transition-all duration-200 shadow-md text-xs`}>
                          Get Started
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Think & Learn Column */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-violet-600 to-emerald-600 text-transparent bg-clip-text">
                Think & Learn
              </h3>
              {[activities[2], activities[3]].map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="group relative animate-fade-in"
                    style={{ animationDelay: activity.delay }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${activity.bgGradient} rounded-2xl transform group-hover:scale-105 transition-transform duration-300`}></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                      {/* Icon */}
                      <div className="mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${activity.gradient} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="text-lg font-bold mb-2 text-gray-800">
                        {activity.title}
                      </h4>
                      <p className="text-gray-600 mb-4 leading-relaxed text-xs">
                        {activity.description}
                      </p>

                      {/* CTA Button */}
                      <Link to={activity.path}>
                        <Button className={`w-full bg-gradient-to-r ${activity.gradient} hover:opacity-90 text-white py-2 rounded-xl font-semibold transform group-hover:scale-105 transition-all duration-200 shadow-md text-xs`}>
                          Get Started
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explore & Discover Column */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-orange-600 text-transparent bg-clip-text">
                Explore & Discover
              </h3>
              {[activities[4], activities[6]].map((activity) => {
                const IconComponent = activity.icon;
                const isComingSoon = activity.comingSoon;
                return (
                  <div
                    key={activity.id}
                    className={`group relative animate-fade-in ${isComingSoon ? 'opacity-75' : ''}`}
                    style={{ animationDelay: activity.delay }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${activity.bgGradient} rounded-2xl transform ${!isComingSoon ? 'group-hover:scale-105' : ''} transition-transform duration-300`}></div>
                    <div className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg ${!isComingSoon ? 'hover:shadow-xl' : ''} transition-all duration-300 border border-white/20 ${isComingSoon ? 'cursor-not-allowed' : ''}`}>
                      {/* Coming Soon Badge */}
                      {isComingSoon && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                          Coming Soon
                        </div>
                      )}
                      
                      {/* Icon */}
                      <div className="mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${activity.gradient} rounded-xl flex items-center justify-center mb-2 ${!isComingSoon ? 'group-hover:scale-110' : ''} transition-transform duration-300 ${isComingSoon ? 'opacity-60' : ''}`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className={`text-lg font-bold mb-2 ${isComingSoon ? 'text-gray-600' : 'text-gray-800'}`}>
                        {activity.title}
                      </h4>
                      <p className={`mb-4 leading-relaxed text-xs ${isComingSoon ? 'text-gray-500' : 'text-gray-600'}`}>
                        {activity.description}
                      </p>

                      {/* CTA Button */}
                      {isComingSoon ? (
                        <Button 
                          disabled 
                          className="w-full bg-gray-300 text-gray-500 py-2 rounded-xl font-semibold cursor-not-allowed opacity-60 text-xs"
                        >
                          Coming Soon
                          <Clock className="ml-1 h-3 w-3" />
                        </Button>
                      ) : (
                        <Link to={activity.path}>
                          <Button className={`w-full bg-gradient-to-r ${activity.gradient} hover:opacity-90 text-white py-2 rounded-xl font-semibold transform group-hover:scale-105 transition-all duration-200 shadow-md text-xs`}>
                            Get Started
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test & Challenge Column */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-lime-600 to-green-600 text-transparent bg-clip-text">
                Test & Challenge
              </h3>
              {[activities[5], activities[7]].map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="group relative animate-fade-in"
                    style={{ animationDelay: activity.delay }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${activity.bgGradient} rounded-2xl transform group-hover:scale-105 transition-transform duration-300`}></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                      {/* Icon */}
                      <div className="mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${activity.gradient} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="text-lg font-bold mb-2 text-gray-800">
                        {activity.title}
                      </h4>
                      <p className="text-gray-600 mb-4 leading-relaxed text-xs">
                        {activity.description}
                      </p>

                      {/* CTA Button */}
                      <Link to={activity.path}>
                        <Button className={`w-full bg-gradient-to-r ${activity.gradient} hover:opacity-90 text-white py-2 rounded-xl font-semibold transform group-hover:scale-105 transition-all duration-200 shadow-md text-xs`}>
                          Get Started
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


        </section>
      </div>

      {/* Saved Doodles Section */}
      {user && !loading && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-transparent bg-clip-text">
              Your Creative Journey
            </h2>
            <p className="text-xl text-gray-600">
              Look at all the amazing things you've created!
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <SavedDoodles />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-white/90 via-cyan-50/60 to-purple-50/60 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Safe, Fun & Educational
            </h2>
            <p className="text-xl text-gray-600">
              Designed with care for young creators and their families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-20 h-20 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`h-10 w-10 ${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-3xl p-12 shadow-2xl text-white max-w-4xl mx-auto">
          <Sparkles className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Creating?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of young creators who are already bringing their imagination to life!
          </p>
          <Link to="/doodle">
            <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-200">
              <Rocket className="mr-2 h-5 w-5" />
              Begin Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
