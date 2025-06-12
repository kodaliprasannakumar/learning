import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { 
  Sparkles,
  Play,
  ArrowRight,
  Clock,
  Brain,
  Code,
  Microscope,
  TrendingUp,
  Rocket,
  Database
} from "lucide-react";

export default function AirHighs() {
  const { user, loading } = useAuth();
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const phases = [
      { delay: 500, phase: 1 },
      { delay: 1500, phase: 2 },
      { delay: 2200, phase: 3 },
      { delay: 2900, phase: 4 },
      { delay: 5000, phase: 0 },
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
      id: 'advanced-coding',
      title: 'Advanced Programming',
      description: 'Master complex programming concepts, algorithms, and software development practices',
      icon: Code,
      path: '/advanced-coding',
      color: 'blue',
      gradient: 'from-blue-600 via-indigo-600 to-purple-700',
      delay: '0ms',
      comingSoon: true
    },
    {
      id: 'data-science',
      title: 'Data Science Lab',
      description: 'Analyze real-world datasets, build predictive models, and discover insights through data',
      icon: TrendingUp,
      path: '/data-science',
      color: 'green',
      gradient: 'from-green-600 via-emerald-600 to-teal-700',
      delay: '100ms',
      comingSoon: true
    },
    {
      id: 'ai-research',
      title: 'AI Research Studio',
      description: 'Conduct cutting-edge AI research, train neural networks, and explore machine learning frontiers',
      icon: Brain,
      path: '/ai-research',
      color: 'purple',
      gradient: 'from-purple-600 via-pink-600 to-rose-700',
      delay: '200ms',
      comingSoon: true
    }
  ];

  return (
    <>
      <section className="relative h-[95vh] bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-indigo-50/30 overflow-hidden -mt-32 pt-32">
        <div className="relative container mx-auto px-4 pt-20 pb-16 lg:pt-24 lg:pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg">
                <Sparkles className="h-4 w-4" />
                <span>Welcome to Air Highs - High School Edition</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-8">
                <div className="overflow-hidden">
                  <span 
                    className={`bg-gradient-to-r from-purple-600 via-blue-600 via-indigo-600 to-cyan-600 text-transparent leading-[1.2] bg-clip-text inline-block transform transition-all duration-1000 ease-out ${
                      animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    }`}
                  >
                    High School
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
                    AI
                  </span>
                  <span 
                    className={`text-gray-800 inline-block transform transition-all duration-1000 ease-out ${
                      animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    }`}
                    style={{ transitionDelay: '0.6s' }}
                  >
                    Excellence
                  </span>
                </div>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Master professional-grade 
                <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text"> AI and computer science skills</span> 
                that will prepare you for top universities and tech careers!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={scrollToActivities}
                  className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Mastering
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="activities-section" className="bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-indigo-50/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Coming Soon
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-level AI tools for high school students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {activities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="group relative opacity-75"
                  style={{ animationDelay: activity.delay }}
                >
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg transition-all duration-300 border border-white/20 cursor-not-allowed">
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Coming Soon
                    </div>
                    
                    <div className="mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${activity.gradient} rounded-xl flex items-center justify-center mb-3 opacity-60`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    <h4 className="text-xl font-bold mb-3 text-gray-600">
                      {activity.title}
                    </h4>
                    <p className="mb-6 leading-relaxed text-sm text-gray-500">
                      {activity.description}
                    </p>

                    <Button 
                      disabled 
                      className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed opacity-60 text-sm"
                    >
                      Coming Soon
                      <Clock className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
} 