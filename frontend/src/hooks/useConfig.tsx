import { useState, useEffect, useCallback } from 'react';
import ConfigService from '../services/ConfigService';
import { useNotification } from './useNotification';
import { AllSettings } from '../types';

interface UseConfigResult {
  config: AllSettings | null;
  loading: boolean;
  error: string | null;
  saveSettings: (app: string, settings: object) => Promise<boolean>;
  loadSettings: () => Promise<void>;
  resetSettings: () => Promise<boolean>;
  updateTheme: (isDarkMode: boolean) => Promise<boolean>;
}

/**
 * Hook for interacting with application configuration
 */
export function useConfig(): UseConfigResult {
  const [config, setConfig] = useState<AllSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  
  // Load settings from the API
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ConfigService.getConfig(true); // Force refresh
      setConfig(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Save settings for a specific application
  const saveSettings = useCallback(async (app: string, settings: object): Promise<boolean> => {
    try {
      const result = await ConfigService.updateConfig(app, settings);
      
      if (result.success) {
        showNotification(`${app.charAt(0).toUpperCase() + app.slice(1)} settings saved successfully`, 'success');
        if (result.data) {
          setConfig(result.data);
        }
        return true;
      } else {
        showNotification(`Failed to save ${app} settings`, 'error');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to save ${app} settings`;
      showNotification(errorMessage, 'error');
      return false;
    }
  }, [showNotification]);
  
  // Reset all settings to defaults
  const resetSettings = useCallback(async (): Promise<boolean> => {
    try {
      const success = await ConfigService.resetConfig();
      
      if (success) {
        showNotification('Settings reset to defaults', 'success');
        await loadSettings(); // Reload settings to get the defaults
        return true;
      } else {
        showNotification('Failed to reset settings', 'error');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset settings';
      showNotification(errorMessage, 'error');
      return false;
    }
  }, [loadSettings, showNotification]);
  
  // Update theme setting
  const updateTheme = useCallback(async (isDarkMode: boolean): Promise<boolean> => {
    try {
      const success = await ConfigService.updateTheme(isDarkMode);
      
      if (!success) {
        console.warn('Could not save theme preference to server');
      }
      
      // We'll return true even if server save fails, as the theme
      // is primarily managed by localStorage in the browser
      return true;
    } catch (err) {
      console.error('Error updating theme:', err);
      return false;
    }
  }, []);
  
  // Load settings on initial mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  
  return {
    config,
    loading,
    error,
    saveSettings,
    loadSettings,
    resetSettings,
    updateTheme
  };
}

export default useConfig;
