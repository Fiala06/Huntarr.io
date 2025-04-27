import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Navigation/Sidebar';
import TopBar from '../Navigation/TopBar';
import AuthGuard from '../Auth/AuthGuard';
import { useTheme } from '../../contexts/ThemeProvider';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <AuthGuard>
      <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
        <Sidebar />
        <div className="main-content">
          <TopBar />
          <div className="content-wrapper">
            <Outlet />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default MainLayout;
