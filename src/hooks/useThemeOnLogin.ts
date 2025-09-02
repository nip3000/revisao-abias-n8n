import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { setupAuthListener } from '@/services/authService';

export const useThemeOnLogin = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Set up auth state listener to apply light theme on login
    const { data: { subscription } } = setupAuthListener((session) => {
      if (session?.user) {
        // User logged in - force light theme
        setTheme('light');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setTheme]);
};