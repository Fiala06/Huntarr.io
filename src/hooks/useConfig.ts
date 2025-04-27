import { useState, useEffect, useCallback } from 'react';
import ConfigManager from '../services/ConfigManager';
import { AppSettings, AllSettings } from '../types';
import { useNotification } from './useNotification';

interface UseConfigResult {
  config: AllSettings | null;
  loading: boolean;
  error: string | null;
  getConfigValue: <T>(key: string, defaultValue?: T | null) => Promise<T | null>;
  updateConfig: (app: string, settings: AppSettings | object) => Promise<boolean>;
  resetConfig: () => Promise<boolean>;
  refreshConfig: () => Promise<void>;
}

export function useConfig(): UseConfigResult {
  const [config, setConfig] = useState<AllSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const refreshConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ConfigManager.getConfig(true); // Force refresh
      setConfig(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getConfigValue = useCallback(async <T>(key: string, defaultValue: T | null = null): Promise<T | null> => {
    return ConfigManager.getConfigValue(key, defaultValue);
  }, []);

  const updateConfig = useCallback(async (app: string, settings: AppSettings | object): Promise<boolean> => {
    try {
      const success = await ConfigManager.updateConfig(app, settings);
      if (success) {
        showNotification(`${app.charAt(0).toUpperCase() + app.slice(1)} settings updated successfully`, 'success');
        await refreshConfig();
        return true;
      } else {
        throw new Error(`Failed to update ${app} settings`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update ${app} settings`;
      showNotification(errorMessage, 'error');
      return false;
    }
  }, [refreshConfig, showNotification]);

  const resetConfig = useCallback(async (): Promise<boolean> => {
    try {
      const success = await ConfigManager.resetConfig();
      if (success) {
        showNotification('Configuration reset to defaults', 'success');
        await refreshConfig();
        return true;
      } else {
        throw new Error('Failed to reset configuration');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset configuration';
      showNotification(errorMessage, 'error');
      return false;
    }
  }, [refreshConfig, showNotification]);

  // Load config on initial mount
  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  return {
    config,
    loading,
    error,
    getConfigValue,
    updateConfig,
    resetConfig,
    refreshConfig
  };
}

export default useConfig;
