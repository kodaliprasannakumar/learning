
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <span className="text-2xl font-bold bg-gradient-to-r from-kid-blue to-primary bg-clip-text text-transparent">KidCreate</span>
        </Link>
        
        <nav className="hidden md:flex gap-6">
          <NavLink to="/" active={location.pathname === "/"}>
            Home
          </NavLink>
          <NavLink to="/doodle" active={location.pathname === "/doodle"}>
            Doodle-to-Video
          </NavLink>
          <NavLink to="/story" active={location.pathname === "/story"}>
            Story Generator
          </NavLink>
        </nav>
        
        <div className="flex md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ 
  children, 
  to, 
  active 
}: { 
  children: React.ReactNode; 
  to: string; 
  active: boolean;
}) => {
  return (
    <Link
      to={to}
      className={cn(
        "relative text-base font-medium transition-colors hover:text-foreground/80",
        active 
          ? "text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-primary after:content-['']" 
          : "text-foreground/60"
      )}
    >
      {children}
    </Link>
  );
};

const MobileNav = () => {
  return (
    <nav className="flex md:hidden">
      <Link to="/" className="mr-4 p-2">
        <span className="sr-only">Home</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </Link>
      <Link to="/doodle" className="mr-4 p-2">
        <span className="sr-only">Doodle</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      </Link>
      <Link to="/story" className="p-2">
        <span className="sr-only">Story</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
        </svg>
      </Link>
    </nav>
  );
};

export default Header;
