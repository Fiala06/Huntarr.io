import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Check system preference and localStorage for initial theme
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('huntarr-dark-mode');
    return savedTheme !== null ? savedTheme === 'true' : prefersDark;
  });

  // Update localStorage and apply theme class when isDarkMode changes
  useEffect(() => {
    localStorage.setItem('huntarr-dark-mode', String(isDarkMode));
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    
    // Also update server setting if user is logged in
    const updateServerTheme = async () => {
      try {
        await fetch('/api/settings/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ dark_mode: isDarkMode })
        });
      } catch (error) {
        // Silent fail for theme preference (non-critical)
        console.warn('Could not save theme preference to server:', error);
      }
    };
    
    // Only attempt to update server if we're on a page that requires authentication
    if (!['/login', '/setup'].includes(window.location.pathname)) {
      updateServerTheme();
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
