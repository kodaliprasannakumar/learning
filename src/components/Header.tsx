import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { Palette, Video, BookOpen, Puzzle, LogOut, LogIn, Menu, X, Lightbulb, Coins } from 'lucide-react';
import { CreditDisplay } from './CreditDisplay';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isScrollingDown = prevScrollPos < currentScrollPos;
      const isScrollingUp = prevScrollPos > currentScrollPos;
      const isMinimalScroll = currentScrollPos < 10;
      
      // Always show header at the top of the page or when scrolling up
      if (isMinimalScroll || isScrollingUp) {
        setVisible(true);
      } 
      // Hide when scrolling down and not at the top
      else if (isScrollingDown && currentScrollPos > 50) {
        setVisible(false);
      }
      
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

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
    <header 
      className={`bg-gradient-to-r from-kid-pink/30 via-kid-yellow/30 to-kid-green/30 border-b-2 border-kid-pink/30 shadow-md sticky top-0 z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        {/* Desktop Layout */}
        <div className="flex justify-between items-center">
          {/* Logo - Left column */}
          <div className="flex-1 flex items-center">
            <Link to="/">
              <img src="public/images/AIR.png" alt="Botadoodle Logo" className="h-15 w-15 sm:h-18 sm:w-24" />
            </Link>
          </div>
          
          {/* Navigation - Center column (hidden on mobile) */}
          <nav className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-8 md:gap-10 bg-white/60 backdrop-blur-sm rounded-full px-8 py-3 shadow-md border-2 border-white/30">
              <Link 
                to="/doodle" 
                className={`flex flex-col items-center text-sm text-foreground transition-all duration-300 ${
                  isActive('/doodle') 
                    ? 'text-kid-blue font-bold scale-110' 
                    : 'hover:text-kid-blue hover:scale-110'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-1.5 transition-all duration-300 ${
                  isActive('/doodle') 
                    ? 'bg-gradient-to-br from-kid-blue/80 to-cyan-400 shadow-lg shadow-kid-blue/30 transform rotate-3' 
                    : 'bg-white/80 hover:bg-gradient-to-br hover:from-kid-blue/20 hover:to-cyan-100 hover:shadow-md hover:rotate-3'
                }`}>
                  <Video className={`h-6 w-6 transition-colors ${isActive('/doodle') ? 'text-white' : 'text-gray-600 group-hover:text-kid-blue'}`} />
                </div>
                <span className="font-medium">Doodle</span>
              </Link>
              
              <Link 
                to="/story" 
                className={`flex flex-col items-center text-sm text-foreground transition-all duration-300 ${
                  isActive('/story') 
                    ? 'text-amber-500 font-bold scale-110' 
                    : 'hover:text-amber-500 hover:scale-110'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-1.5 transition-all duration-300 ${
                  isActive('/story') 
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-300 shadow-lg shadow-amber-500/30 transform -rotate-3' 
                    : 'bg-white/80 hover:bg-gradient-to-br hover:from-amber-500/20 hover:to-yellow-100 hover:shadow-md hover:-rotate-3'
                }`}>
                  <BookOpen className={`h-6 w-6 transition-colors ${isActive('/story') ? 'text-white' : 'text-gray-600 group-hover:text-amber-500'}`} />
                </div>
                <span className="font-medium">Story</span>
              </Link>
              
              <Link 
                to="/puzzle" 
                className={`flex flex-col items-center text-sm text-foreground transition-all duration-300 ${
                  isActive('/puzzle') 
                    ? 'text-purple-600 font-bold scale-110' 
                    : 'hover:text-purple-600 hover:scale-110'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-1.5 transition-all duration-300 ${
                  isActive('/puzzle') 
                    ? 'bg-gradient-to-br from-purple-600 to-violet-400 shadow-lg shadow-purple-600/30 transform rotate-3' 
                    : 'bg-white/80 hover:bg-gradient-to-br hover:from-purple-600/20 hover:to-violet-100 hover:shadow-md hover:rotate-3'
                }`}>
                  <Puzzle className={`h-6 w-6 transition-colors ${isActive('/puzzle') ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'}`} />
                </div>
                <span className="font-medium">Puzzle</span>
              </Link>
              
              <Link 
                to="/quote" 
                className={`flex flex-col items-center text-sm text-foreground transition-all duration-300 ${
                  isActive('/quote') 
                    ? 'text-amber-600 font-bold scale-110' 
                    : 'hover:text-amber-600 hover:scale-110'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-1.5 transition-all duration-300 ${
                  isActive('/quote') 
                    ? 'bg-gradient-to-br from-amber-600 to-orange-300 shadow-lg shadow-amber-600/30 transform -rotate-3' 
                    : 'bg-white/80 hover:bg-gradient-to-br hover:from-amber-600/20 hover:to-orange-100 hover:shadow-md hover:-rotate-3'
                }`}>
                  <Lightbulb className={`h-6 w-6 transition-colors ${isActive('/quote') ? 'text-white' : 'text-gray-600 group-hover:text-amber-600'}`} />
                </div>
                <span className="font-medium">Quotes</span>
              </Link>
              
              <Link 
                to="/credits" 
                className={`flex flex-col items-center text-sm text-foreground transition-all duration-300 ${
                  isActive('/credits') 
                    ? 'text-amber-600 font-bold scale-110' 
                    : 'hover:text-amber-600 hover:scale-110'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-1.5 transition-all duration-300 ${
                  isActive('/credits') 
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-300 shadow-lg shadow-amber-500/30 transform rotate-3' 
                    : 'bg-white/80 hover:bg-gradient-to-br hover:from-amber-500/20 hover:to-yellow-100 hover:shadow-md hover:rotate-3'
                }`}>
                  <Coins className={`h-6 w-6 transition-colors ${isActive('/credits') ? 'text-white' : 'text-gray-600 group-hover:text-amber-500'}`} />
                </div>
                <span className="font-medium">Credits</span>
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
                className="flex items-center gap-2.5 h-auto py-2.5 px-5 rounded-full bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-300 text-red-500 hover:shadow-md hover:shadow-red-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')} 
                className="flex items-center gap-2.5 h-auto py-2.5 px-5 rounded-full bg-gradient-to-r from-blue-100/80 to-cyan-50 border-2 border-kid-blue/50 text-kid-blue hover:shadow-md hover:shadow-kid-blue/30 hover:-translate-y-1 transition-all duration-300"
              >
                <LogIn className="h-5 w-5" />
                <span className="font-medium">Sign In</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Menu (Dropdown) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm mt-3 py-4 px-4 rounded-xl shadow-lg border-2 border-kid-pink/30 animate-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col gap-3">
              <Link 
                to="/doodle" 
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 ${
                  isActive('/doodle') 
                    ? 'bg-gradient-to-r from-kid-blue/80 to-cyan-400/80 text-white font-medium shadow-md' 
                    : 'hover:bg-gradient-to-r hover:from-kid-blue/10 hover:to-cyan-50 hover:text-kid-blue hover:shadow-sm'
                }`}
                onClick={closeMenu}
              >
                <Video className={`h-5 w-5 ${isActive('/doodle') ? 'text-white' : ''}`} />
                <span>Doodle</span>
              </Link>
              
              <Link 
                to="/story" 
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 ${
                  isActive('/story') 
                    ? 'bg-gradient-to-r from-amber-500/80 to-yellow-300/80 text-white font-medium shadow-md' 
                    : 'hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-50 hover:text-amber-500 hover:shadow-sm'
                }`}
                onClick={closeMenu}
              >
                <BookOpen className={`h-5 w-5 ${isActive('/story') ? 'text-white' : ''}`} />
                <span>Story</span>
              </Link>
              
              <Link 
                to="/puzzle" 
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 ${
                  isActive('/puzzle') 
                    ? 'bg-gradient-to-r from-purple-600/80 to-violet-400/80 text-white font-medium shadow-md' 
                    : 'hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-violet-50 hover:text-purple-600 hover:shadow-sm'
                }`}
                onClick={closeMenu}
              >
                <Puzzle className={`h-5 w-5 ${isActive('/puzzle') ? 'text-white' : ''}`} />
                <span>Puzzle</span>
              </Link>
              
              <Link 
                to="/quote" 
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 ${
                  isActive('/quote') 
                    ? 'bg-gradient-to-r from-amber-600/80 to-orange-300/80 text-white font-medium shadow-md' 
                    : 'hover:bg-gradient-to-r hover:from-amber-600/10 hover:to-orange-50 hover:text-amber-600 hover:shadow-sm'
                }`}
                onClick={closeMenu}
              >
                <Lightbulb className={`h-5 w-5 ${isActive('/quote') ? 'text-white' : ''}`} />
                <span>Quotes</span>
              </Link>
              
              <Link 
                to="/credits" 
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 ${
                  isActive('/credits') 
                    ? 'bg-gradient-to-r from-amber-500/80 to-yellow-300/80 text-white font-medium shadow-md' 
                    : 'hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-50 hover:text-amber-500 hover:shadow-sm'
                }`}
                onClick={closeMenu}
              >
                <Coins className={`h-5 w-5 ${isActive('/credits') ? 'text-white' : ''}`} />
                <span>Credits</span>
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
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-300 text-red-500 hover:shadow-md hover:shadow-red-200/50 hover:-translate-y-1 transition-all duration-300"
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
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-blue-100/80 to-cyan-50 border-2 border-kid-blue/50 text-kid-blue hover:shadow-md hover:shadow-kid-blue/30 hover:-translate-y-1 transition-all duration-300"
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
