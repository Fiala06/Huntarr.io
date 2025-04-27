import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

interface ThemeContextType {
  isDarkTheme: boolean;
  applyDarkTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkTheme: true,
  applyDarkTheme: async () => {}
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  
  const applyDarkTheme = useCallback(async (): Promise<void> => {
    document.documentElement.classList.add('dark-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('huntarr-dark-mode', 'true');
    setIsDarkTheme(true);
    
    try {
      // Update server setting to dark mode
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dark_mode: true })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save theme: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving theme to server:', error);
      // Theme still applied locally even if server update fails
    }
  }, []);

  // Apply theme on mount - always enforce dark theme
  useEffect(() => {
    applyDarkTheme();
  }, [applyDarkTheme]);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, applyDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
