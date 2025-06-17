import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  Sparkles,
  Clock,
  Brain,
  Code,
  TrendingUp
} from "lucide-react";

export default function AirHighs() {
  const { user, loading } = useAuth();

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
    <div className="bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-indigo-50/30 py-16">
      {/* Page Header */}
      <div className="container mx-auto px-4 text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg">
          <Sparkles className="h-4 w-4" />
          <span>Welcome to Air Highs - High School Edition</span>
        </div>
        
        <h1 className="text-4xl lg:text-6xl font-bold mb-8">
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 via-indigo-600 to-cyan-600 text-transparent leading-[1.2] bg-clip-text">
            High School AI Excellence
          </span>
        </h1>
        
        <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Master professional-grade 
          <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text"> AI and computer science skills </span> 
          that will prepare you for top universities and tech careers!
        </p>
      </div>

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
    </div>
  );
} 