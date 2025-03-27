
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SavedDoodles from "@/components/SavedDoodles";

export default function Index() {
  const { user, loading } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 text-gradient animate-gradient">Kids AI Studio</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Inspire creativity and imagination with our AI-powered tools designed specially for kids.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-8 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900">
          <div className="h-40 mb-6 flex items-center justify-center">
            <img src="/placeholder.svg" alt="Doodle illustration" className="h-full" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Doodle to Video</h2>
          <p className="mb-6 text-muted-foreground">
            Turn simple drawings into animated videos with our AI-powered doodle transformer.
          </p>
          <Link to="/doodle">
            <Button className="bg-kid-blue hover:bg-kid-blue/80 text-white w-full">
              Start Doodling
            </Button>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-red-50 dark:from-amber-950/20 dark:to-red-950/20 p-8 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900">
          <div className="h-40 mb-6 flex items-center justify-center">
            <img src="/placeholder.svg" alt="Story illustration" className="h-full" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Story Generator</h2>
          <p className="mb-6 text-muted-foreground">
            Create fantastic stories with colorful characters and exciting adventures.
          </p>
          <Link to="/story">
            <Button className="bg-kid-orange hover:bg-kid-orange/80 text-white w-full">
              Create a Story
            </Button>
          </Link>
        </div>
      </div>
      
      {user && !loading && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Your Saved Doodles</h2>
          <SavedDoodles />
        </div>
      )}
      
      <div className="bg-muted/30 rounded-xl p-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Safe & Educational</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe Content</h3>
            <p className="text-muted-foreground">
              All content is monitored and filtered to ensure it's appropriate for children.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Creative Learning</h3>
            <p className="text-muted-foreground">
              Encourages imagination and storytelling skills through interactive activities.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Parent Approved</h3>
            <p className="text-muted-foreground">
              Designed with input from parents and educators for peace of mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
