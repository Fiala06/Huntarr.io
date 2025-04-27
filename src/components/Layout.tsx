import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !location.pathname.startsWith('/login') && !location.pathname.startsWith('/setup')) {
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);
  
  // Get current section from URL
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path.startsWith('/logs')) return 'Logs';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/user')) return 'User Profile';
    return 'Huntarr';
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar pageTitle={getPageTitle()} />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
