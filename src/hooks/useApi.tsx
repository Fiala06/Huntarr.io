import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';

interface RequestOptions extends RequestInit {
  showErrorNotification?: boolean;
  showSuccessNotification?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useApi() {
  const [loading, setLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();
  
  const fetchData = useCallback(async <T,>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
    const {
      showErrorNotification = true,
      showSuccessNotification = false,
      successMessage = 'Request successful',
      errorMessage = 'An error occurred',
      ...fetchOptions
    } = options;
    
    setLoading(true);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        },
        ...fetchOptions
      });
      
      const data = await response.json();
      
      setLoading(false);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      if (showSuccessNotification) {
        showNotification(successMessage, 'success');
      }
      
      return { data, error: null, loading: false };
    } catch (err) {
      setLoading(false);
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (showErrorNotification) {
        showNotification(errorMessage + (error.message ? `: ${error.message}` : ''), 'error');
      }
      
      return { data: null, error, loading: false };
    }
  }, [showNotification]);
  
  return { 
    fetchData,
    loading
  };
}
