import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { Palette, Video, BookOpen, Puzzle, LogOut, LogIn, Menu, X, Lightbulb } from 'lucide-react';
import { CreditDisplay } from './CreditDisplay';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-kid-pink/30 via-kid-yellow/30 to-kid-green/30 border-b-2 border-kid-pink/30 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        {/* Desktop Layout */}
        <div className="flex justify-between items-center">
          {/* Logo - Left column */}
          <div className="flex-1 flex items-center">
            <Link 
              to="/" 
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-kid-blue text-transparent bg-clip-text flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
              onClick={closeMenu}
            >
              <Palette className="h-9 w-9 sm:h-9 sm:w-8 text-kid-blue" />
              <span>Botadoodle</span>
            </Link>
          </div>
          
          {/* Navigation - Center column (hidden on mobile) */}
          <nav className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-8 md:gap-10 bg-white/50 backdrop-blur-sm rounded-full px-8 py-3 shadow-sm">
              <Link 
                to="/doodle" 
                className={`flex flex-col items-center text-sm text-foreground transition-all duration-200 ${
                  isActive('/doodle') 
                    ? 'text-kid-blue font-medium scale-110' 
                    : 'hover:text-kid-blue hover:scale-105'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-1.5 ${isActive('/doodle') ? 'bg-kid-blue/10' : 'hover:bg-kid-blue/5'}`}>
                  <Video className={`h-6 w-6 ${isActive('/doodle') ? 'text-kid-blue' : ''}`} />
                </div>
                <span className="font-medium">Doodle</span>
              </Link>
              
              <Link 
                to="/story" 
                className={`flex flex-col items-center text-sm text-foreground transition-all duration-200 ${
                  isActive('/story') 
                    ? 'text-amber-500 font-medium scale-110' 
                    : 'hover:text-amber-500 hover:scale-105'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-1.5 ${isActive('/story') ? 'bg-amber-500/10' : 'hover:bg-amber-500/5'}`}>
                  <BookOpen className={`h-6 w-6 ${isActive('/story') ? 'text-amber-500' : ''}`} />
                </div>
                <span className="font-medium">Story</span>
              </Link>
              
              <Link 
                to="/puzzle" 
                className={`flex flex-col items-center text-sm text-foreground transition-all duration-200 ${
                  isActive('/puzzle') 
                    ? 'text-purple-600 font-medium scale-110' 
                    : 'hover:text-purple-600 hover:scale-105'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-1.5 ${isActive('/puzzle') ? 'bg-purple-600/10' : 'hover:bg-purple-600/5'}`}>
                  <Puzzle className={`h-6 w-6 ${isActive('/puzzle') ? 'text-purple-600' : ''}`} />
                </div>
                <span className="font-medium">Puzzle</span>
              </Link>
              
              <Link 
                to="/quote" 
                className={`flex flex-col items-center text-sm text-foreground transition-all duration-200 ${
                  isActive('/quote') 
                    ? 'text-amber-600 font-medium scale-110' 
                    : 'hover:text-amber-600 hover:scale-105'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-1.5 ${isActive('/quote') ? 'bg-amber-500/10' : 'hover:bg-amber-500/5'}`}>
                  <Lightbulb className={`h-6 w-6 ${isActive('/quote') ? 'text-amber-500' : ''}`} />
                </div>
                <span className="font-medium">Quotes</span>
              </Link>
            </div>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center mx-4">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm hover:bg-white/70 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-kid-blue" />
              ) : (
                <Menu className="h-6 w-6 text-kid-blue" />
              )}
            </button>
          </div>
          
          {/* Auth section - Right column (visible on desktop, hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-3">
            {user && <CreditDisplay className="mr-2" />}
            
            {user ? (
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                className="flex items-center gap-2.5 h-auto py-2.5 px-5 rounded-full border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')} 
                className="flex items-center gap-2.5 h-auto py-2.5 px-5 rounded-full border-2 border-kid-blue/30 text-kid-blue hover:bg-kid-blue/10 hover:border-kid-blue/50 transition-all duration-200"
              >
                <LogIn className="h-5 w-5" />
                <span className="font-medium">Sign In</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Menu (Dropdown) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm mt-3 py-4 px-4 rounded-xl shadow-lg border border-kid-pink/20 animate-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col gap-3">
              <Link 
                to="/doodle" 
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                  isActive('/doodle') 
                    ? 'bg-kid-blue/10 text-kid-blue font-medium' 
                    : 'hover:bg-kid-blue/5 hover:text-kid-blue'
                }`}
                onClick={closeMenu}
              >
                <Video className={`h-5 w-5 ${isActive('/doodle') ? 'text-kid-blue' : ''}`} />
                <span>Doodle</span>
              </Link>
              
              <Link 
                to="/story" 
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                  isActive('/story') 
                    ? 'bg-amber-500/10 text-amber-500 font-medium' 
                    : 'hover:bg-amber-500/5 hover:text-amber-500'
                }`}
                onClick={closeMenu}
              >
                <BookOpen className={`h-5 w-5 ${isActive('/story') ? 'text-amber-500' : ''}`} />
                <span>Story</span>
              </Link>
              
              <Link 
                to="/puzzle" 
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                  isActive('/puzzle') 
                    ? 'bg-purple-600/10 text-purple-600 font-medium' 
                    : 'hover:bg-purple-600/5 hover:text-purple-600'
                }`}
                onClick={closeMenu}
              >
                <Puzzle className={`h-5 w-5 ${isActive('/puzzle') ? 'text-purple-600' : ''}`} />
                <span>Puzzle</span>
              </Link>
              
              <Link 
                to="/quote" 
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                  isActive('/quote') 
                    ? 'bg-amber-500/10 text-amber-500 font-medium' 
                    : 'hover:bg-amber-500/5 hover:text-amber-500'
                }`}
                onClick={closeMenu}
              >
                <Lightbulb className={`h-5 w-5 ${isActive('/quote') ? 'text-amber-500' : ''}`} />
                <span>Quotes</span>
              </Link>
              
              {user && (
                <div className="p-2.5 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Your Credits:</span>
                  <CreditDisplay displayType="full" />
                </div>
              )}
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                {user ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleSignOut();
                      closeMenu();
                    }} 
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate('/auth');
                      closeMenu();
                    }} 
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-kid-blue/30 text-kid-blue hover:bg-kid-blue/10"
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="font-medium">Sign In</span>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
