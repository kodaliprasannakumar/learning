import { useAuth } from "@/hooks/useAuth";
import { 
  Sparkles,
  Brain
} from "lucide-react";

export default function AirHighs() {
  const { user, loading } = useAuth();

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
            Advanced Learning Hub
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional-level AI tools for high school students are being developed. Check back soon for exciting new features!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl max-w-4xl mx-auto text-center">
          <Brain className="h-20 w-20 mx-auto mb-6 text-purple-600" />
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            Features In Development
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            We're working on bringing you cutting-edge tools for advanced programming, data science, 
            and AI research. These features will help prepare you for top universities and tech careers.
          </p>
        </div>
      </div>
    </div>
  );
} 