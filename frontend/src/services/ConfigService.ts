import { AllSettings } from '../types';

/**
 * Config Service for frontend
 * Provides methods for interacting with the application configuration
 */
class ConfigService {
  private configCache: AllSettings | null = null;
  private lastFetchTime: number = 0;
  private cacheTTL: number = 2000; // 2 seconds cache time
  
  /**
   * Fetches configuration from the backend API
   * @param forceRefresh Whether to bypass cache and force a new API call
   * @returns The configuration object
   */
  async getConfig(forceRefresh = false): Promise<AllSettings | null> {
    const now = Date.now();
    
    // Return cached config if it's still valid and refresh not forced
    if (!forceRefresh && this.configCache && now - this.lastFetchTime < this.cacheTTL) {
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
   * Updates specific application settings
   * @param app The application to update (e.g., 'sonarr', 'radarr', 'general')
   * @param settings The settings to update
   * @returns Success status and updated settings
   */
  async updateConfig(app: string, settings: object): Promise<{success: boolean, data?: AllSettings}> {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [app]: settings }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.status} ${response.statusText}`);
      }
      
      // Get the updated settings from the response
      const updatedSettings = await response.json();
      
      // Update cache
      this.configCache = updatedSettings;
      this.lastFetchTime = Date.now();
      
      return { success: true, data: updatedSettings };
    } catch (error) {
      console.error(`Error updating settings for ${app}:`, error);
      return { success: false };
    }
  }
  
  /**
   * Reset all settings to defaults
   * @returns Success status
   */
  async resetConfig(): Promise<boolean> {
    try {
      const response = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reset settings: ${response.status} ${response.statusText}`);
      }
      
      // Invalidate cache
      this.invalidateCache();
      
      return true;
    } catch (error) {
      console.error('Error resetting configuration:', error);
      return false;
    }
  }
  
  /**
   * Updates theme settings
   * @param isDarkMode Whether dark mode is enabled
   * @returns Success status
   */
  async updateTheme(isDarkMode: boolean): Promise<boolean> {
    try {
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dark_mode: isDarkMode }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update theme: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating theme:', error);
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

// Export as singleton
export default new ConfigService();
