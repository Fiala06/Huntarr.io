import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/new-style.css'; // Path is already relative to src directory
import './styles/Button.css'; // Path is already relative to src directory

// Component to handle redirect logic
const RedirectHandler = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/setup') {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, location.pathname]);
  
  return null;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <RedirectHandler />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<HomePage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="user" element={<UserPage />} />
              <Route path="*" element={<HomePage />} />
            </Route>
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
