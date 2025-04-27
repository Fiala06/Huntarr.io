import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useNotification } from './NotificationContext';
import { useApi } from '../hooks/useApi';

// Define the settings structure
interface AppSettings {
  api_url?: string;
  api_key?: string;
  hunt_missing?: number;
  hunt_upgrades?: number;
  search_interval?: number;
  api_timeout?: number;
  enabled?: boolean;
  [key: string]: any;
}

interface GeneralSettings {
  timezone?: string;
  dark_mode?: boolean;
  auto_update?: boolean;
}

interface AllSettings {
  sonarr: AppSettings;
  radarr: AppSettings;
  lidarr: AppSettings;
  readarr: AppSettings;
  whisparr: AppSettings;
  general: GeneralSettings;
}

interface SettingsContextType {
  settings: AllSettings | null;
  originalSettings: AllSettings | null;
  isLoading: boolean;
  error: string | null;
  saveSettings: (appName: string, appSettings: AppSettings | GeneralSettings) => Promise<boolean>;
  loadSettings: () => Promise<void>;
  resetSettings: () => Promise<boolean>;
  updateSettingField: (app: string, field: string, value: any) => void;
  hasUnsavedChanges: (app: string) => boolean;
}

const defaultSettings: AllSettings = {
  sonarr: {},
  radarr: {},
  lidarr: {},
  readarr: {},
  whisparr: {},
  general: {}
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<AllSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/settings');
      
      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setSettings(data);
      setOriginalSettings(JSON.parse(JSON.stringify(data))); // Deep copy
    } catch (error) {
      console.error('Error loading settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
      showNotification('Failed to load settings', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const saveSettings = useCallback(async (appName: string, appSettings: AppSettings | GeneralSettings) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [appName]: appSettings
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status} ${response.statusText}`);
      }
      
      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(updatedSettings))); // Deep copy
      showNotification(`${appName.charAt(0).toUpperCase() + appName.slice(1)} settings saved successfully`, 'success');
      return true;
    } catch (error) {
      console.error(`Error saving ${appName} settings:`, error);
      showNotification(`Failed to save ${appName} settings`, 'error');
      return false;
    }
  }, [showNotification]);

  const resetSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reset settings: ${response.status} ${response.statusText}`);
      }
      
      await loadSettings();
      showNotification('All settings have been reset to defaults', 'info');
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      showNotification('Failed to reset settings', 'error');
      return false;
    }
  }, [loadSettings, showNotification]);

  const updateSettingField = useCallback((app: string, field: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [app]: {
          ...prev[app],
          [field]: value
        }
      };
    });
  }, []);

  const hasUnsavedChanges = useCallback((app: string) => {
    if (!settings?.[app] || !originalSettings?.[app]) return false;
    
    return JSON.stringify(settings[app]) !== JSON.stringify(originalSettings[app]);
  }, [settings, originalSettings]);

  // Load settings on initial mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        originalSettings,
        isLoading, 
        error, 
        saveSettings, 
        loadSettings, 
        resetSettings,
        updateSettingField,
        hasUnsavedChanges
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
};
