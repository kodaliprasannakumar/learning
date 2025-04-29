import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SavedDoodles from "@/components/SavedDoodles";
import { Video, BookOpen, Puzzle, Shield, Star, Palette, Lightbulb, Globe } from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16 animate-fade-in">
        {/* <div className="flex justify-center mb-4">
          <Palette className="h-12 w-12 text-kid-blue" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Botadoodle</h1> */}
        {/* <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your doodles into amazing artwork, stories, and more with the power of AI
        </p> */}
      </div>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold py-4 animate-fade-in leading-[1.4]">Welcome to Your Creative Playground!</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          Unleash your imagination and watch your ideas come to life with our fun, interactive tools.
        </p>
        <div className="relative my-8">
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 w-full max-w-lg mx-auto">
            
          </div>
          <p className="text-lg italic text-purple-600 font-medium">Choose Your Adventure Below!</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        <div className="card-glow-blue bg-gradient-to-br from-kid-blue/5 to-indigo-50 p-8 rounded-2xl shadow-lg card-hover">
          <div className="h-40 mb-6 flex items-center justify-center">
            <div className="bg-kid-blue/10 w-28 h-28 rounded-full flex items-center justify-center">
              <Video className="h-14 w-14 text-kid-blue" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-kid-blue">Doodle to Image</h2>
          <p className="mb-6 text-muted-foreground">
            Turn simple drawings into Images with our AI-powered doodle transformer.
          </p>
          <Link to="/doodle">
            <Button className="kid-button bg-kid-blue hover:bg-kid-blue/80 text-white w-full py-5 text-lg">
              Start Doodling
            </Button>
          </Link>
        </div>
        
        <div className="card-glow-yellow bg-gradient-to-br from-kid-yellow/40 to-amber-50 p-8 rounded-2xl shadow-lg card-hover">
          <div className="h-40 mb-6 flex items-center justify-center">
            <div className="bg-amber-500/10 w-28 h-28 rounded-full flex items-center justify-center">
              <BookOpen className="h-14 w-14 text-amber-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-amber-600">Story Generator</h2>
          <p className="mb-6 text-muted-foreground">
            Create fantastic stories with colorful characters and exciting adventures.
          </p>
          <Link to="/story">
            <Button className="kid-button bg-amber-500 hover:bg-amber-500/80 text-white w-full py-5 text-lg">
              Create a Story
            </Button>
          </Link>
        </div>

        <div className="card-glow-purple bg-gradient-to-br from-kid-purple/20 to-purple-50 p-8 rounded-2xl shadow-lg card-hover">
          <div className="h-40 mb-6 flex items-center justify-center">
            <div className="bg-purple-500/10 w-28 h-28 rounded-full flex items-center justify-center">
              <Puzzle className="h-14 w-14 text-purple-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-purple-600">Puzzle Challenge</h2>
          <p className="mb-6 text-muted-foreground">
            Solve interactive puzzles to learn sentence and get creative AI-powered responses.
          </p>
          <Link to="/puzzle">
            <Button className="kid-button bg-purple-600 hover:bg-purple-600/80 text-white w-full py-5 text-lg">
              Start Puzzling
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-5xl mx-auto mb-16">
        <div className="card-glow-yellow bg-gradient-to-br from-amber-100 to-amber-50 p-8 rounded-2xl shadow-lg card-hover">
          <div className="h-40 mb-6 flex items-center justify-center">
            <div className="bg-amber-500/10 w-28 h-28 rounded-full flex items-center justify-center">
              <Lightbulb className="h-14 w-14 text-amber-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-amber-600">Daily Wisdom</h2>
          <p className="mb-6 text-muted-foreground">
            Complete inspirational quotes to build wisdom, vocabulary, and a positive mindset.
          </p>
          <Link to="/quote">
            <Button className="kid-button bg-amber-500 hover:bg-amber-500/80 text-white w-full py-5 text-lg">
              Get Daily Wisdom
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-5xl mx-auto mb-16">
        <div className="card-glow-indigo bg-gradient-to-br from-indigo-100 to-blue-50 p-8 rounded-2xl shadow-lg card-hover">
          <div className="h-40 mb-6 flex items-center justify-center">
            <div className="bg-indigo-500/10 w-28 h-28 rounded-full flex items-center justify-center">
              <Globe className="h-14 w-14 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-indigo-600">Space Explorer</h2>
          <p className="mb-6 text-muted-foreground">
            Explore cosmic questions and get answers from our AI space expert by interacting with a 3D globe.
          </p>
          <Link to="/space">
            <Button className="kid-button bg-indigo-600 hover:bg-indigo-600/80 text-white w-full py-5 text-lg">
              Explore Space
            </Button>
          </Link>
        </div>
      </div>
      
      {user && !loading && (
        <div className="mb-16 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-kid-blue to-purple-600 text-transparent bg-clip-text">Your Saved Doodles</h2>
          <SavedDoodles />
        </div>
      )}
      
      <div className="bg-gradient-to-br from-kid-pink/20 to-kid-yellow/20 rounded-2xl p-8 max-w-5xl mx-auto border-4 border-kid-pink/30 shadow-lg animate-fade-in" style={{ animationDelay: "500ms" }}>
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-rose-600 to-amber-500 text-transparent bg-clip-text">Safe & Educational</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-green-700">Safe Content</h3>
            <p className="text-muted-foreground">
              All content is monitored and filtered to ensure it's appropriate for children.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-blue-700">Creative Learning</h3>
            <p className="text-muted-foreground">
              Encourages imagination and storytelling skills through interactive activities.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center shadow-md">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-purple-700">Parent Approved</h3>
            <p className="text-muted-foreground">
              Designed with input from parents and educators for peace of mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
