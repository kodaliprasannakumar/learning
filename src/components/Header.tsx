
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { Palette, Video, BookOpen, Puzzle, LogOut, LogIn } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-gradient-to-r from-kid-pink/30 via-kid-yellow/30 to-kid-green/30 border-b-2 border-kid-pink/30 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-kid-blue text-transparent bg-clip-text flex items-center gap-2">
          <Palette className="h-7 w-7 text-kid-blue" />
          <span>Kids AI</span>
        </Link>
        <nav className="flex items-center gap-3 md:gap-6">
          <Link 
            to="/doodle" 
            className={`flex flex-col items-center text-sm text-foreground transition-colors ${
              isActive('/doodle') 
                ? 'text-kid-blue font-medium' 
                : 'hover:text-kid-blue'
            }`}
          >
            <div className={`p-2 rounded-full mb-1 ${isActive('/doodle') ? 'bg-kid-blue/10' : ''}`}>
              <Video className={`h-5 w-5 ${isActive('/doodle') ? 'text-kid-blue' : ''}`} />
            </div>
            <span>Doodle</span>
          </Link>
          
          <Link 
            to="/story" 
            className={`flex flex-col items-center text-sm text-foreground transition-colors ${
              isActive('/story') 
                ? 'text-amber-500 font-medium' 
                : 'hover:text-amber-500'
            }`}
          >
            <div className={`p-2 rounded-full mb-1 ${isActive('/story') ? 'bg-amber-500/10' : ''}`}>
              <BookOpen className={`h-5 w-5 ${isActive('/story') ? 'text-amber-500' : ''}`} />
            </div>
            <span>Story</span>
          </Link>
          
          <Link 
            to="/puzzle" 
            className={`flex flex-col items-center text-sm text-foreground transition-colors ${
              isActive('/puzzle') 
                ? 'text-purple-600 font-medium' 
                : 'hover:text-purple-600'
            }`}
          >
            <div className={`p-2 rounded-full mb-1 ${isActive('/puzzle') ? 'bg-purple-600/10' : ''}`}>
              <Puzzle className={`h-5 w-5 ${isActive('/puzzle') ? 'text-purple-600' : ''}`} />
            </div>
            <span>Puzzle</span>
          </Link>
          
          {user ? (
            <Button 
              variant="ghost" 
              onClick={handleSignOut} 
              className="flex flex-col items-center h-auto py-1 rounded-lg"
            >
              <div className="p-2 rounded-full mb-1">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="text-xs">Sign Out</span>
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')} 
              className="flex flex-col items-center h-auto py-1 rounded-lg"
            >
              <div className="p-2 rounded-full mb-1">
                <LogIn className="h-5 w-5" />
              </div>
              <span className="text-xs">Sign In</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
