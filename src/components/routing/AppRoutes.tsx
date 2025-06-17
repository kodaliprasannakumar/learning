import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { STORAGE_KEYS } from '@/constants';

// Lazy load pages for better performance
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import NotFound from '@/pages/NotFound';
import AirMids from '@/pages/AirMids';
import AirHighs from '@/pages/AirHighs';
import DoodlePage from '@/pages/DoodlePage';
import StoryPage from '@/pages/StoryPage';
import PuzzlePage from '@/pages/PuzzlePage';
import QuotePage from '@/pages/QuotePage';
import SpaceQuestionsPage from '@/pages/SpaceQuestionsPage';
import QuizPage from '@/pages/QuizPage';
import AITrainerPage from '@/pages/AITrainerPage';
import Math from '@/pages/Math';

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // After login, restore the last intended path
    if (user && location.pathname === '/') {
      const intendedPath = sessionStorage.getItem(STORAGE_KEYS.INTENDED_PATH);
      if (intendedPath && intendedPath !== '/') {
        // Clear it to avoid unexpected redirects
        sessionStorage.removeItem(STORAGE_KEYS.INTENDED_PATH);
        window.history.replaceState(null, '', intendedPath);
      }
    }
  }, [user, location]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/air-mids" element={<AirMids />} />
      <Route path="/air-highs" element={<AirHighs />} />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected routes */}
      <Route 
        path="/doodle" 
        element={
          <ProtectedRoute>
            <DoodlePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/story" 
        element={
          <ProtectedRoute>
            <StoryPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/puzzle" 
        element={
          <ProtectedRoute>
            <PuzzlePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/quote" 
        element={
          <ProtectedRoute>
            <QuotePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/space" 
        element={
          <ProtectedRoute>
            <SpaceQuestionsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/quiz" 
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai-trainer" 
        element={
          <ProtectedRoute>
            <AITrainerPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/math" 
        element={
          <ProtectedRoute>
            <Math />
          </ProtectedRoute>
        } 
      />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}; 