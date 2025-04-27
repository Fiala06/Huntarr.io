import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import NotificationManager from './components/UI/Notifications/NotificationManager';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import MainLayout from './components/Layout/MainLayout';
import HomePage from './pages/HomePage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import UserPage from './pages/UserPage';
import SystemStatusChecker from './components/SystemStatus/SystemStatusChecker';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <NotificationManager />
        <AuthProvider>
          <SettingsProvider>
            <SystemStatusChecker />
            <Routes>
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="logs" element={<LogsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="user" element={<UserPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </SettingsProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
