import { AllSettings, AppSettings } from '../types';

/**
 * Config Manager Service
 * 
 * Handles all configuration operations through API calls rather than direct file access,
 * making it compatible with both frontend and backend models.
 */
class ConfigManager {
  private configCache: AllSettings | null = null;
  private lastFetchTime: number = 0;
  private cacheTTL: number = 2000; // 2 seconds cache time
  
  /**
   * Retrieves the configuration from the API
   * @param forceRefresh Whether to force a refresh of the cache
   * @returns Configuration object
   */
  async getConfig(forceRefresh = false): Promise<AllSettings | null> {
    const now = Date.now();
    
    // Return cached config if it's still valid and not forced to refresh
    if (!forceRefresh && this.configCache && (now - this.lastFetchTime < this.cacheTTL)) {
      return this.configCache;
    }
    
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.status} ${response.statusText}`);
      }
      
      const config = await response.json();
      this.configCache = config;
      this.lastFetchTime = now;
      return config;
    } catch (error) {
      console.error('Error loading configuration:', error);
      return null;
    }
  }
  
  /**
   * Gets a specific value from the configuration
   * @param key Dot-notation key path (e.g., 'sonarr.api_url')
   * @param defaultValue Default value if the key doesn't exist
   * @returns The value or the default value
   */
  async getConfigValue<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    const config = await this.getConfig();
    if (!config) return defaultValue;
    
    if (!key) return config as unknown as T;
    
    const parts = key.split('.');
    let value: any = config;
    
    for (const part of parts) {
      if (value === undefined || value === null) {
        return defaultValue;
      }
      value = value[part];
    }
    
    // Handle numeric values
    if (typeof defaultValue === 'number' && typeof value === 'string') {
      const num = parseInt(value, 10);
      return isNaN(num) ? defaultValue : num as unknown as T;
    }
    
    return (value !== undefined) ? value : defaultValue;
  }
  
  /**
   * Updates a specific app's configuration
   * @param app App name (e.g., 'sonarr', 'radarr')
   * @param settings Settings to update
   * @returns Success status
   */
  async updateConfig(app: string, settings: AppSettings | object): Promise<boolean> {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [app]: settings })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.status} ${response.statusText}`);
      }
      
      // Refresh cache with newest data
      const updatedConfig = await response.json();
      this.configCache = updatedConfig;
      this.lastFetchTime = Date.now();
      
      return true;
    } catch (error) {
      console.error(`Error updating ${app} configuration:`, error);
      return false;
    }
  }
  
  /**
   * Resets all configuration to default values
   * @returns Success status
   */
  async resetConfig(): Promise<boolean> {
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
      
      // Invalidate cache after reset
      this.invalidateCache();
      return true;
    } catch (error) {
      console.error('Error resetting configuration:', error);
      return false;
    }
  }
  
  /**
   * Invalidates the configuration cache
   */
  invalidateCache(): void {
    this.configCache = null;
    this.lastFetchTime = 0;
  }
}

export default new ConfigManager();
