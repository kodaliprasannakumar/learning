import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import DoodlePage from "./pages/DoodlePage";
import StoryPage from "./pages/StoryPage";
import PuzzlePage from "./pages/PuzzlePage";
import QuotePage from "./pages/QuotePage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import SpaceQuestionsPage from "./pages/SpaceQuestionsPage";
import QuizPage from "./pages/QuizPage";
import AITrainerPage from "./pages/AITrainerPage";
import Math from "./pages/Math";
import AirMids from "./pages/AirMids";
import AirHighs from "./pages/AirHighs";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { CreditProvider } from "./hooks/useCreditSystem";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Session persistence component
const SessionPersistence = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Save the current path in sessionStorage when navigating
    const currentPath = location.pathname;
    if (currentPath !== '/auth') {
      sessionStorage.setItem('lastVisitedPath', currentPath);
    }
  }, [location]);
  
  return null;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // When a protected route is loaded, store the attempted path
    if (!user && !loading) {
      sessionStorage.setItem('intendedPath', location.pathname);
    }
  }, [user, loading, location]);
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  if (!user) {
    // Store path they were trying to access
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  // Handle restoration of previous path
  const { user } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // After login, restore the last intended path
    if (user && location.pathname === '/') {
      const intendedPath = sessionStorage.getItem('intendedPath');
      if (intendedPath && intendedPath !== '/') {
        // Clear it to avoid unexpected redirects
        sessionStorage.removeItem('intendedPath');
        window.history.replaceState(null, '', intendedPath);
      }
    }
  }, [user, location]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/air-mids" element={<AirMids />} />
      <Route path="/air-highs" element={<AirHighs />} />
      <Route path="/doodle" element={
        <ProtectedRoute>
          <DoodlePage />
        </ProtectedRoute>
      } />
      <Route path="/story" element={
        <ProtectedRoute>
          <StoryPage />
        </ProtectedRoute>
      } />
      <Route path="/puzzle" element={
        <ProtectedRoute>
          <PuzzlePage />
        </ProtectedRoute>
      } />
      <Route path="/quote" element={
        <ProtectedRoute>
          <QuotePage />
        </ProtectedRoute>
      } />
      <Route path="/space" element={
        <ProtectedRoute>
          <SpaceQuestionsPage />
        </ProtectedRoute>
      } />
      <Route path="/quiz" element={
        <ProtectedRoute>
          <QuizPage />
        </ProtectedRoute>
      } />
      <Route path="/ai-trainer" element={
        <ProtectedRoute>
          <AITrainerPage />
        </ProtectedRoute>
      } />
      <Route path="/math" element={
        <ProtectedRoute>
          <Math />
        </ProtectedRoute>
      } />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CreditProvider>
            <div className="flex min-h-screen flex-col bg-background text-foreground antialiased"
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                   fontFeatureSettings: '"rlig" 1, "calt" 1'
                 }}>
              <Header />
              <main className="flex-1 relative">
                <SessionPersistence />
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </CreditProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
