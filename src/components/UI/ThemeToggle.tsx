import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div className="theme-switcher">
      <div className="switch-label">
        <span className="light-icon"><i className="fas fa-sun"></i></span>
        <span className="dark-icon"><i className="fas fa-moon"></i></span>
      </div>
      <label className="switch">
        <input 
          type="checkbox" 
          checked={isDarkMode} 
          onChange={toggleTheme}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default ThemeToggle;
