
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import { LogIn, UserPlus, Mail, Lock } from "lucide-react";

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
      <Card className="w-full max-w-md border-4 border-kid-blue/30 rounded-2xl shadow-lg bg-white/95">
        <CardHeader className="pb-2">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-kid-blue to-purple-500 flex items-center justify-center">
            {isSignUp ? (
              <UserPlus className="h-8 w-8 text-white" />
            ) : (
              <LogIn className="h-8 w-8 text-white" />
            )}
          </div>
          <CardTitle className="text-center text-2xl bg-gradient-to-r from-kid-blue to-purple-600 text-transparent bg-clip-text">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 border-2 border-kid-blue/20 focus:border-kid-blue/50 rounded-xl h-12"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 border-2 border-kid-blue/20 focus:border-kid-blue/50 rounded-xl h-12"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium rounded-xl bg-gradient-to-r from-kid-blue to-purple-600 hover:brightness-110 shadow-md"
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </Button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-xs text-muted-foreground">OR</span>
              </div>
            </div>
            
            <p 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-center text-sm cursor-pointer hover:underline text-kid-blue"
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
