import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopBar.css';

interface TopBarProps {
  title?: string;
}

const TopBar: React.FC<TopBarProps> = ({ title = 'Home' }) => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch current user info
    fetch('/api/user/info')
      .then(response => response.json())
      .then(data => {
        if (data.username) {
          setUsername(data.username);
        }
      })
      .catch(error => {
        console.error('Error loading username:', error);
      });
  }, []);

  // Dynamic title based on location
  const getPageTitle = (): string => {
    if (title) return title;
    
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path.startsWith('/logs')) return 'Logs';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/user')) return 'User Settings';
    return 'Huntarr';
  };

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        navigate('/login');
      } else {
        console.error('Logout failed:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="top-bar">
      <h1 className="page-title" id="currentPageTitle">{getPageTitle()}</h1>
      <div className="user-info">
        <span id="username">{username}</span>
        <a href="/logout" onClick={handleLogout} id="logoutLink" className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
        </a>
      </div>
    </div>
  );
};

export default TopBar;
