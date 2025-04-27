import { useState, useCallback, useEffect } from 'react';
import { useNotification } from './useNotification';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  autoFetch?: boolean;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
  errorMessage?: string;
  requiresAuth?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  clearError: () => void;
}

export function useApi<T>(url: string, options: ApiOptions = {}): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(options.autoFetch !== false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: options.requiresAuth !== false ? 'include' : 'same-origin'
      };
      
      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
      }
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      
      // Show success notification if configured
      if (options.showSuccessNotification) {
        showNotification(options.successMessage || 'Operation completed successfully', 'success');
      }
      
      return result;
    } catch (error) {
      console.error('API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      
      // Show error notification if configured
      if (options.showErrorNotification) {
        showNotification(
          options.errorMessage ? `${options.errorMessage}: ${errorMessage}` : errorMessage, 
          'error'
        );
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [
    url, 
    options.method, 
    options.body, 
    options.headers, 
    options.requiresAuth,
    options.showSuccessNotification,
    options.successMessage,
    options.showErrorNotification,
    options.errorMessage,
    showNotification
  ]);

  // Auto-fetch data when component mounts if autoFetch is true
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData().catch(() => {
        // Error already handled in fetchData
      });
    }
  }, [fetchData, options.autoFetch]);

  return { data, loading, error, fetchData, clearError };
}

export default useApi;
