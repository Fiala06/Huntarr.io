import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './common/ThemeToggle';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const logoImg = new Image();
    logoImg.src = '/static/logo/64.png';
    logoImg.onload = () => setLogoLoaded(true);
  }, []);

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img 
          src="/static/logo/64.png" 
          alt="Huntarr Logo" 
          className={`logo ${logoLoaded ? 'loaded' : ''}`} 
        />
        <h1>Huntarr</h1>
      </div>
      
      <nav className="nav-menu">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} id="homeNav">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <Link to="/logs" className={`nav-item ${location.pathname === '/logs' ? 'active' : ''}`} id="logsNav">
          <i className="fas fa-file-alt"></i>
          <span>Logs</span>
        </Link>
        <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`} id="settingsNav">
          <i className="fas fa-cog"></i>
          <span>Settings</span>
        </Link>
        <Link to="/user" className={`nav-item ${location.pathname === '/user' ? 'active' : ''}`} id="userNav">
          <i className="fas fa-user"></i>
          <span>User</span>
        </Link>
      </nav>
      
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Sidebar;
