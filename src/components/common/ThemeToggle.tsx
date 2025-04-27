import React from 'react';
import { useThemeToggle } from '../../hooks/useThemeToggle';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDarkTheme } = useThemeToggle();

  return (
    <div className={`theme-toggle-container ${className}`}>
      <div className="switch-label">
        <span className="dark-icon"><i className="fas fa-moon"></i></span>
      </div>
      <label className="switch" aria-label="Dark theme">
        <input
          type="checkbox"
          checked={isDarkTheme}
          disabled={true} // Disabled since we only support dark mode
          id="themeToggle"
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default ThemeToggle;
