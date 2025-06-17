import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { STORAGE_KEYS } from '@/constants';

export const SessionPersistence = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Save the current path in sessionStorage when navigating
    const currentPath = location.pathname;
    if (currentPath !== '/auth') {
      sessionStorage.setItem(STORAGE_KEYS.LAST_VISITED_PATH, currentPath);
    }
  }, [location]);
  
  // This component doesn't render anything, it just handles side effects
  return null;
}; 