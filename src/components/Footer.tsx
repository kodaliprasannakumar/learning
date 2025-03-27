
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          © {new Date().getFullYear()} KidCreate. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/doodle" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Doodle-to-Video
          </Link>
          <Link to="/story" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Story Generator
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
