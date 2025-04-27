import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';

interface User {
  username: string;
  is_2fa_enabled: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
  otp_code?: string;
}

interface LoginResponse {
  success: boolean;
  redirect?: string;
  error?: string;
  requires_2fa?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/info', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      const data: LoginResponse = await response.json();

      if (data.success) {
        await checkAuthStatus();
        return data;
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Failed to connect to server'
      };
    }
  }, [checkAuthStatus]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
        showNotification('You have been logged out successfully', 'success');
        return true;
      } else {
        showNotification('Logout failed: ' + (data.error || 'Unknown error'), 'error');
        return false;
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to connect to server during logout', 'error');
      return false;
    }
  }, [navigate, showNotification]);

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
