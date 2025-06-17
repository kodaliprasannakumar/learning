
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCreditSystem } from "@/hooks/useCreditSystem";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Star, 
  Heart,
  LogOut,
  User,
  Coins
} from "lucide-react";
import { motion } from "framer-motion";

const Header = () => {
  const { user, signOut } = useAuth();
  const { credits } = useCreditSystem();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-500 border-b-4 border-white/30 backdrop-blur-sm shadow-lg"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Sparkles className="h-6 w-6 text-purple-600" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Wizzle
              </h1>
              <p className="text-xs text-white/90 font-medium">
                AI Magic for Kids! ✨
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/doodle">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 rounded-full px-4 py-2 font-semibold transition-all duration-200 hover:scale-105"
              >
                🎨 Draw
              </Button>
            </Link>
            <Link to="/story">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 rounded-full px-4 py-2 font-semibold transition-all duration-200 hover:scale-105"
              >
                📚 Stories
              </Button>
            </Link>
            <Link to="/puzzle">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 rounded-full px-4 py-2 font-semibold transition-all duration-200 hover:scale-105"
              >
                🧩 Puzzles
              </Button>
            </Link>
            <Link to="/quiz">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 rounded-full px-4 py-2 font-semibold transition-all duration-200 hover:scale-105"
              >
                🎯 Quiz
              </Button>
            </Link>
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Credits Display */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2"
                >
                  <Coins className="h-5 w-5 text-yellow-300" />
                  <span className="font-bold text-white">{credits}</span>
                </motion.div>

                {/* User Menu */}
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <User className="h-5 w-5 text-white" />
                  </motion.div>
                  
                  <Button
                    onClick={signOut}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-6 py-2 font-bold shadow-lg transition-all duration-200 hover:scale-105">
                  <Star className="mr-2 h-4 w-4" />
                  Join Fun!
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
