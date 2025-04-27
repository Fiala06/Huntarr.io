import { useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useThemeToggle = () => {
  const [isToggling, setIsToggling] = useState(false);
  const { isDarkTheme, applyDarkTheme } = useTheme();

  const toggleTheme = useCallback(async () => {
    if (isToggling) return;
    
    try {
      setIsToggling(true);
      await applyDarkTheme(); // Only support applying dark theme
    } finally {
      setIsToggling(false);
    }
  }, [isToggling, applyDarkTheme]);

  return { 
    isDarkTheme, 
    toggleTheme,
    isToggling
  };
};
