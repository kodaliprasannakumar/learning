
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Kids AI</Link>
        <nav className="flex items-center gap-4">
          <Link to="/doodle" className="text-foreground hover:text-primary">Doodle</Link>
          <Link to="/story" className="text-foreground hover:text-primary">Story</Link>
          {user ? (
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          ) : (
            <Button variant="outline" onClick={() => navigate('/auth')}>Sign In</Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
