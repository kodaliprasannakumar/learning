import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t-2 border-kid-yellow/40 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left flex items-center gap-1">
          © {new Date().getFullYear()} Wizzle. Made with 
          <Heart className="h-3 w-3 text-rose-500 animate-pulse" fill="currentColor" />
          for kids.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-kid-blue transition-colors">
            Home
          </Link>
          <Link to="/doodle" className="text-sm text-muted-foreground hover:text-kid-blue transition-colors">
            Doodle-to-Video
          </Link>
          <Link to="/story" className="text-sm text-muted-foreground hover:text-kid-blue transition-colors">
            Story Generator
          </Link>
          <Link to="/puzzle" className="text-sm text-muted-foreground hover:text-kid-blue transition-colors">
            Puzzle Challenge
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
