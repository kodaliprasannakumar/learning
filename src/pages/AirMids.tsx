import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calculator,
  Sparkles,
  ArrowRight,
  Clock,
  Brain,
  Target,
  Zap
} from "lucide-react";

export default function AirMids() {
  const { user, loading } = useAuth();

  const activities = [
    {
      id: 'math',
      title: 'Math Adventure',
      description: 'Explore advanced mathematical concepts through interactive AI-powered challenges and real-world problem solving',
      icon: Calculator,
      path: '/math',
      color: 'orange',
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      bgGradient: 'from-orange-50 via-red-50 to-pink-100',
      delay: '0ms'
    },
    {
      id: 'advanced-ai',
      title: 'Advanced AI Lab',
      description: 'Dive deeper into machine learning concepts and build more sophisticated AI models',
      icon: Brain,
      path: '/advanced-ai',
      color: 'purple',
      gradient: 'from-purple-500 via-indigo-500 to-blue-600',
      bgGradient: 'from-purple-50 via-indigo-50 to-blue-100',
      delay: '100ms',
      comingSoon: true
    },
    {
      id: 'logic-puzzles',
      title: 'Logic & Reasoning',
      description: 'Challenge your critical thinking with complex puzzles and logical reasoning problems',
      icon: Target,
      path: '/logic',
      color: 'green',
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      bgGradient: 'from-green-50 via-emerald-50 to-teal-100',
      delay: '200ms',
      comingSoon: true
    },
    {
      id: 'coding-basics',
      title: 'Coding Fundamentals',
      description: 'Learn programming basics through fun, interactive coding challenges and projects',
      icon: Zap,
      path: '/coding',
      color: 'blue',
      gradient: 'from-blue-500 via-cyan-500 to-indigo-600',
      bgGradient: 'from-blue-50 via-cyan-50 to-indigo-100',
      delay: '300ms',
      comingSoon: true
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'Advanced Learning',
      description: 'More complex challenges designed for developing minds',
      color: 'text-purple-600',
      bg: 'bg-gradient-to-br from-purple-100 to-indigo-200'
    },
    {
      icon: Target,
      title: 'Critical Thinking',
      description: 'Develop analytical and problem-solving skills',
      color: 'text-green-600',
      bg: 'bg-gradient-to-br from-green-100 to-emerald-200'
    },
    {
      icon: Zap,
      title: 'Interactive Learning',
      description: 'Hands-on experiences that make learning engaging',
      color: 'text-blue-600',
      bg: 'bg-gradient-to-br from-blue-100 to-cyan-200'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-green-50/30 via-blue-50/20 to-purple-50/30 py-16">
      {/* Page Header */}
      <div className="container mx-auto px-4 text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg">
          <Sparkles className="h-4 w-4" />
          <span>Welcome to Air Mids - Middle School Edition</span>
        </div>
        
        <h1 className="text-4xl lg:text-6xl font-bold mb-8">
          <span className="bg-gradient-to-r from-green-600 via-blue-600 via-purple-600 to-pink-600 text-transparent leading-[1.2] bg-clip-text">
            Middle School AI Adventures
          </span>
        </h1>
        
        <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Take your learning to the next level with 
          <span className="font-semibold bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text"> advanced AI-powered tools </span> 
          designed specifically for middle school minds ready for bigger challenges!
        </p>
      </div>

      {/* Activities Grid */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-transparent bg-clip-text">
            Choose Your Challenge
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced tools designed for curious middle school minds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            const isComingSoon = activity.comingSoon;
            return (
              <div
                key={activity.id}
                className={`group relative ${isComingSoon ? 'opacity-75' : ''}`}
                style={{ animationDelay: activity.delay }}
              >
                <div className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg ${!isComingSoon ? 'hover:shadow-xl hover:scale-105' : ''} transition-all duration-300 border border-white/20 ${isComingSoon ? 'cursor-not-allowed' : ''}`}>
                  {/* Coming Soon Badge */}
                  {isComingSoon && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Coming Soon
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className="mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${activity.gradient} rounded-xl flex items-center justify-center mb-3 ${isComingSoon ? 'opacity-60' : ''}`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className={`text-xl font-bold mb-3 ${isComingSoon ? 'text-gray-600' : 'text-gray-800'}`}>
                    {activity.title}
                  </h4>
                  <p className={`mb-6 leading-relaxed text-sm ${isComingSoon ? 'text-gray-500' : 'text-gray-600'}`}>
                    {activity.description}
                  </p>

                  {/* CTA Button */}
                  {isComingSoon ? (
                    <Button 
                      disabled 
                      className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed opacity-60 text-sm"
                    >
                      Coming Soon
                      <Clock className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Link to={activity.path}>
                      <Button className={`w-full bg-gradient-to-r ${activity.gradient} hover:opacity-90 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-md text-sm`}>
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-green-50/30 via-blue-50/20 to-purple-50/30 py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl p-12 shadow-xl max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-transparent bg-clip-text">
                Advanced Learning for Growing Minds
              </h2>
              <p className="text-xl text-gray-600">
                Designed specifically for middle school students ready for the next level
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="text-center group"
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
        </div>
      </section>
    </div>
  );
} 