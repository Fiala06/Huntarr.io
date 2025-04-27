import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './useNotification';

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

export function useAuth() {
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
      } else {
        showNotification('Logout failed: ' + (data.error || 'Unknown error'), 'error');
      }
      
      return data.success;
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

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };
}
