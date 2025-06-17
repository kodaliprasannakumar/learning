import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLoadingSpinner } from './LoadingSpinner';
import { STORAGE_KEYS } from '@/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/auth',
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // When a protected route is loaded, store the attempted path
    if (requireAuth && !user && !loading) {
      sessionStorage.setItem(STORAGE_KEYS.INTENDED_PATH, location.pathname);
    }
  }, [user, loading, location, requireAuth]);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return <PageLoadingSpinner />;
  }
  
  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  // If authentication is not required, or user is authenticated
  return <>{children}</>;
}; 