
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
          <span className="bg-gradient-to-r from-kid-blue to-primary bg-clip-text text-transparent">
            Unleash Your Creativity
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "150ms" }}>
          Turn doodles into videos and create magical stories with KidCreate — where imagination comes to life!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "300ms" }}>
          <Link to="/doodle">
            <Button className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce px-8 py-6 text-lg">
              Start Doodling
            </Button>
          </Link>
          <Link to="/story">
            <Button variant="outline" className="btn-bounce px-8 py-6 text-lg">
              Create a Story
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-kid-blue to-primary bg-clip-text text-transparent">
            Magical Features
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <FeatureCard
            title="Doodle to Video"
            description="Watch your drawings come to life! Draw anything you can imagine and see it transform into an animated video."
            color="kid-blue"
            index={1}
            link="/doodle"
          />
          <FeatureCard
            title="Story Generator"
            description="Mix and match characters, settings, and objects to create unique stories. Let AI weave them together into an exciting adventure!"
            color="pink"
            index={2}
            link="/story"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 rounded-3xl px-6 md:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-kid-blue to-primary bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Create"
            description="Draw a doodle or select story elements from our magical collection."
          />
          <StepCard
            number="2"
            title="Transform"
            description="Our AI wizards transform your creation into videos or stories."
          />
          <StepCard
            number="3"
            title="Enjoy"
            description="Watch, read, share, and save your magical creations!"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to create something amazing?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Join thousands of kids who are turning their imagination into reality!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/doodle">
            <Button className="bg-kid-blue hover:bg-kid-blue/80 text-white btn-bounce px-8 py-6 text-lg">
              Start Creating Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  color: string;
  index: number;
  link: string;
}

const FeatureCard = ({ title, description, color, index, link }: FeatureCardProps) => {
  return (
    <Card className="glass-card overflow-hidden card-hover">
      <Link to={link} className="block p-8">
        <div 
          className="mb-6 w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
          style={{ backgroundColor: `hsl(var(--${color}))` }}
        >
          {index}
        </div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </Link>
    </Card>
  );
};

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard = ({ number, title, description }: StepCardProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center text-center p-6",
      "transform transition-transform hover:translate-y-[-5px] duration-300"
    )}>
      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md animate-float">
        <span className="text-2xl font-bold bg-gradient-to-r from-kid-blue to-primary bg-clip-text text-transparent">
          {number}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
