import { useCallback } from 'react';
import { useApi } from './useApi';

interface BackendApiOptions {
  method?: string;
  body?: any;
  requiresAuth?: boolean;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
  errorMessage?: string;
  autoFetch?: boolean;
}

export function useBackendApi<T = any>(endpoint: string, options: BackendApiOptions = {}) {
  // Ensure the endpoint starts with /api/
  const apiEndpoint = endpoint.startsWith('/api/') 
    ? endpoint 
    : `/api/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
  
  // Apply default options for backend APIs
  const apiOptions = {
    ...options,
    requiresAuth: options.requiresAuth !== false, // Default to requiring auth
  };
  
  return useApi<T>(apiEndpoint, apiOptions);
}

// Common backend API operations
export function useSettings() {
  const { data, loading, error, fetchData } = useBackendApi<any>('settings');
  
  const saveSettings = useCallback(async (appName: string, settings: any) => {
    const { data: result } = await useBackendApi('settings', {
      method: 'POST',
      body: { [appName]: settings },
      requiresAuth: true,
      showSuccessNotification: true,
      successMessage: `${appName} settings saved successfully`,
      showErrorNotification: true,
      errorMessage: `Failed to save ${appName} settings`,
      autoFetch: false
    });
    
    return result;
  }, []);
  
  const resetSettings = useCallback(async () => {
    const { data: result } = await useBackendApi('settings/reset', {
      method: 'POST',
      requiresAuth: true,
      showSuccessNotification: true,
      successMessage: 'Settings reset to defaults',
      showErrorNotification: true,
      errorMessage: 'Failed to reset settings',
      autoFetch: false
    });
    
    return result;
  }, []);
  
  return {
    settings: data,
    loading,
    error,
    loadSettings: fetchData,
    saveSettings,
    resetSettings
  };
}

export function useStats() {
  const { data, loading, error, fetchData } = useBackendApi<{success: boolean, stats: any}>('stats');
  
  const resetStats = useCallback(async (appType?: string) => {
    const body = appType ? { app_type: appType } : undefined;
    
    const { data: result } = await useBackendApi('stats/reset', {
      method: 'POST',
      body,
      showSuccessNotification: true,
      successMessage: appType 
        ? `Statistics for ${appType} reset successfully`
        : 'All statistics reset successfully',
      showErrorNotification: true,
      errorMessage: 'Failed to reset statistics',
      autoFetch: false
    });
    
    return result;
  }, []);
  
  return {
    stats: data?.stats || {},
    loading,
    error,
    loadStats: fetchData,
    resetStats
  };
}

export function useSystemStatus() {
  return useBackendApi('system/status', {
    showErrorNotification: false
  });
}

export default useBackendApi;
