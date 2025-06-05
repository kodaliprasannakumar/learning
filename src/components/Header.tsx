import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { Palette, Video, BookOpen, Puzzle, LogOut, LogIn, Menu, X, Lightbulb, Coins, Globe, ClipboardCheck, Brain, Sparkles } from 'lucide-react';
import { CreditDisplay } from './CreditDisplay';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  // Check if we're on the Index page
  const isIndexPage = location.pathname === '/';

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

  const navItems = [
    { path: '/doodle', icon: Video, label: 'Doodle', gradient: 'from-cyan-500 to-blue-600', hoverClass: 'hover:from-cyan-500 hover:to-blue-600' },
    { path: '/story', icon: BookOpen, label: 'Story', gradient: 'from-orange-500 to-amber-600', hoverClass: 'hover:from-orange-500 hover:to-amber-600' },
    { path: '/puzzle', icon: Puzzle, label: 'Puzzle', gradient: 'from-violet-500 to-fuchsia-600', hoverClass: 'hover:from-violet-500 hover:to-fuchsia-600' },
    { path: '/quote', icon: Lightbulb, label: 'Wisdom', gradient: 'from-emerald-500 to-teal-600', hoverClass: 'hover:from-emerald-500 hover:to-teal-600' },
    { path: '/space', icon: Globe, label: 'Space', gradient: 'from-indigo-600 to-purple-600', hoverClass: 'hover:from-indigo-600 hover:to-purple-600' },
    { path: '/quiz', icon: ClipboardCheck, label: 'Quiz', gradient: 'from-lime-500 to-green-600', hoverClass: 'hover:from-lime-500 hover:to-green-600' },
    { path: '/ai-trainer', icon: Brain, label: 'AI Academy', gradient: 'from-rose-500 to-pink-600', hoverClass: 'hover:from-rose-500 hover:to-pink-600' },
  ];

  return (
    <header 
      className={`${
        isIndexPage 
          ? 'bg-transparent backdrop-blur-none border-none shadow-none' 
          : 'bg-gradient-to-r from-white/95 via-blue-50/90 to-purple-50/90 backdrop-blur-lg border-b border-white/30 shadow-lg'
      } sticky top-2 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      } relative`}
    >
      <div className="container mx-auto px-4 sm:px-6 pt-4 pb-3 sm:pt-6 sm:pb-4">
        {/* Desktop Layout */}
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center group">
            <Link to="/" className="flex items-center">
              <div className="relative">
                <img src="/images/AIR_1.png" alt="Wizzle Logo" className="h-12 w-12 md:h-16 md:w-16 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
            </Link>
           
            <div className="ml-4">
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">Wiz</span>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">zle</span>
              </h1>
              
              {/* Beta Tag */}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-md">
                <Sparkles className="h-3 w-3" />
                <span>BETA</span>
              </div>
            </div>
          </div>
          
          {/* Navigation - Center (hidden on mobile and on Index page) */}
          {!isIndexPage && (
            <nav className="hidden lg:flex">
              <div className="flex items-center gap-2 bg-white/85 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg border border-white/40">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isItemActive = isActive(item.path);
                  return (
                    <Link 
                      key={item.path}
                      to={item.path} 
                      className={`group flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-300 ${
                        isItemActive 
                          ? 'scale-110 shadow-md' 
                          : 'hover:scale-105 hover:shadow-sm'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg mb-1.5 transition-all duration-300 ${
                        isItemActive 
                          ? `bg-gradient-to-br ${item.gradient} shadow-md` 
                          : `bg-gray-100 bg-gradient-to-br ${item.hoverClass} hover:shadow-sm`
                      }`}>
                        <IconComponent className={`h-4 w-4 transition-all duration-300 ${
                          isItemActive 
                            ? 'text-white' 
                            : 'text-gray-600 hover:text-white'
                        }`} />
                      </div>
                      <span className={`text-xs font-medium transition-colors duration-300 ${
                        isItemActive 
                          ? 'text-purple-600 font-semibold' 
                          : 'text-gray-600 group-hover:text-purple-600'
                      }`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
                
                <div className="w-px h-8 bg-gray-300 mx-2"></div>
                
                <Link 
                  to="/credits" 
                  className={`group flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-300 ${
                    isActive('/credits') 
                      ? 'scale-110 shadow-md' 
                      : 'hover:scale-105 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg mb-1.5 transition-all duration-300 ${
                    isActive('/credits') 
                      ? 'bg-gradient-to-br from-amber-500 to-yellow-500 shadow-md' 
                      : 'bg-gray-100 hover:bg-gradient-to-br hover:from-amber-500 hover:to-yellow-500 hover:shadow-sm'
                  }`}>
                    <Coins className={`h-4 w-4 transition-all duration-300 ${
                      isActive('/credits') 
                        ? 'text-white' 
                        : 'text-gray-600 hover:text-white'
                    }`} />
                  </div>
                  <span className={`text-xs font-medium transition-colors duration-300 ${
                    isActive('/credits') 
                      ? 'text-amber-600 font-semibold' 
                      : 'text-gray-600 group-hover:text-amber-600'
                  }`}>
                    Credits
                  </span>
                </Link>
              </div>
            </nav>
          )}
          
          {/* Mobile menu button (hidden on Index page) */}
          {!isIndexPage && (
            <div className="lg:hidden flex items-center mx-4">
              <button
                onClick={toggleMobileMenu}
                className="p-3 rounded-2xl bg-white/85 backdrop-blur-md shadow-md hover:shadow-lg border border-white/40 transition-all duration-300 hover:scale-105"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )}
              </button>
            </div>
          )}
          
          {/* Auth section - Right (visible on desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {user && (
              <div className={`${
                isIndexPage 
                  ? 'bg-white/20 backdrop-blur-md border border-white/30' 
                  : 'bg-white/90 border border-white/40'
              } rounded-full px-4 py-2 shadow-lg transition-all duration-300`}>
                <CreditDisplay className="text-sm font-medium" />
              </div>
            )}
            
            {user ? (
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                className={`group flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                  isIndexPage 
                    ? 'bg-white/20 backdrop-blur-md border border-white/30 text-gray-700 hover:bg-white/30 hover:text-gray-800 shadow-lg' 
                    : 'bg-gradient-to-r from-red-100 to-pink-100 border border-red-300 text-red-600 hover:from-red-200 hover:to-pink-200 shadow-md'
                }`}
              >
                <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>Sign Out</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')} 
                className={`group flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                  isIndexPage 
                    ? 'bg-white/20 backdrop-blur-md border border-white/30 text-gray-700 hover:bg-white/30 hover:text-gray-800 shadow-lg' 
                    : 'bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300 text-blue-600 hover:from-blue-200 hover:to-cyan-200 shadow-md'
                }`}
              >
                <LogIn className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Menu (Dropdown) - hidden on Index page */}
        {!isIndexPage && mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-lg mt-4 py-6 px-6 rounded-2xl shadow-xl border border-white/40 animate-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      isActive(item.path) 
                        ? `bg-gradient-to-r ${item.gradient} text-white font-medium shadow-md` 
                        : `hover:bg-gradient-to-r hover:${item.gradient} hover:text-white hover:shadow-sm text-gray-700`
                    }`}
                    onClick={closeMenu}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive(item.path) 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 group-hover:bg-white/20'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              <Link 
                to="/credits" 
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isActive('/credits') 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium shadow-md' 
                    : 'hover:bg-gradient-to-r hover:from-amber-500 hover:to-yellow-500 hover:text-white hover:shadow-sm text-gray-700'
                }`}
                onClick={closeMenu}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive('/credits') 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-white/20'
                }`}>
                  <Coins className="h-5 w-5" />
                </div>
                <span className="font-medium">Credits</span>
              </Link>
              
              {user && (
                <div className="p-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <span className="text-sm font-medium text-gray-700">Your Credits:</span>
                  <CreditDisplay displayType="full" />
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                {user ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleSignOut();
                      closeMenu();
                    }} 
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 border border-red-300 text-red-600 hover:from-red-200 hover:to-pink-200 hover:shadow-md transition-all duration-300"
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
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300 text-blue-600 hover:from-blue-200 hover:to-cyan-200 hover:shadow-md transition-all duration-300"
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
      
      {/* Bottom line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
        isIndexPage 
          ? 'bg-gradient-to-r from-transparent via-black/30 to-transparent' 
          : 'bg-gradient-to-r from-transparent via-black/20 to-transparent'
      } transition-all duration-300`}></div>
    </header>
  );
};

export default Header;
