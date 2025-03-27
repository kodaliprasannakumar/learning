
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/components/ui/sonner";

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Account created successfully!");
      } else {
        await signIn(email, password);
        toast.success("Logged in successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              {isSignUp ? "Sign Up" : "Log In"}
            </Button>
            <p 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-center text-sm text-muted-foreground cursor-pointer hover:underline"
            >
              {isSignUp 
                ? "Already have an account? Log in" 
                : "Don't have an account? Sign up"}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
