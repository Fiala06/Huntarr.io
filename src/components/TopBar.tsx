import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  pageTitle: string;
}

const TopBar: React.FC<TopBarProps> = ({ pageTitle }) => {
  const { username, logout } = useAuth();

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    logout();
  };

  return (
    <div className="top-bar">
      <div className="page-title" id="currentPageTitle">{pageTitle}</div>
      <div className="user-info">
        <span id="username">{username}</span>
        <a href="#" className="logout-btn" id="logoutLink" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </a>
      </div>
    </div>
  );
};

export default TopBar;
