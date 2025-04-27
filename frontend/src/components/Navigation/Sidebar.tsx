import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeProvider';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Function to check if a nav item is active
  const isActive = (path: string): boolean => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img 
          src="/static/logo/64.png" 
          alt="Huntarr Logo" 
          className="logo" 
          onLoad={(e) => e.currentTarget.classList.add('loaded')}
        />
        <h1>Huntarr</h1>
      </div>
      
      <nav className="nav-menu">
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <Link to="/logs" className={`nav-item ${isActive('/logs') ? 'active' : ''}`}>
          <i className="fas fa-file-alt"></i>
          <span>Logs</span>
        </Link>
        <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
          <i className="fas fa-cog"></i>
          <span>Settings</span>
        </Link>
        <Link to="/user" className={`nav-item ${isActive('/user') ? 'active' : ''}`}>
          <i className="fas fa-user"></i>
          <span>User</span>
        </Link>
      </nav>
      
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
    </div>
  );
};

export default Sidebar;
