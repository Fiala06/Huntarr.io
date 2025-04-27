import { AppSettings } from '../types';
import ConfigManager from './ConfigManager';

// Single instance for making arr application requests
class ArrApiManager {
  // Helper to determine API version based on app type
  private getApiBaseVersion(appType: string): string {
    switch (appType.toLowerCase()) {
      case 'sonarr':
      case 'radarr':
        return 'api/v3';
      case 'lidarr':
      case 'readarr':
      case 'whisparr':
        return 'api/v1';
      default:
        // Default to v3 for unknown app types
        return 'api/v3';
    }
  }

  // Generic request method for all arr apps
  async makeRequest<T = any>(
    appType: string, 
    apiUrl: string, 
    apiKey: string, 
    endpoint: string, 
    method: string = 'GET', 
    data: any = null,
    timeout: number = 120
  ): Promise<T> {
    // Make sure the URL doesn't end with a slash
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    
    // Make sure the endpoint doesn't start with a slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Build the URL
    const url = `${baseUrl}/${this.getApiBaseVersion(appType)}/${cleanEndpoint}`;
    
    // Set up headers
    const headers = {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    };
    
    // Set up fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      // Add a simple AbortController for timeout handling
      signal: AbortSignal.timeout(timeout * 1000)
    };
    
    // Add body for POST/PUT requests
    if (method !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Some endpoints may return no content
      if (response.status === 204) {
        return {} as T;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in ${appType} request to ${endpoint}:`, error);
      throw error;
    }
  }

  // Helper methods for common operations
  async checkConnection(appType: string, apiUrl: string, apiKey: string): Promise<boolean> {
    try {
      await this.makeRequest(appType, apiUrl, apiKey, 'system/status');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSystemStatus(appType: string, apiUrl: string, apiKey: string): Promise<any> {
    return this.makeRequest(appType, apiUrl, apiKey, 'system/status');
  }

  async getQueue(appType: string, apiUrl: string, apiKey: string): Promise<any> {
    return this.makeRequest(appType, apiUrl, apiKey, 'queue');
  }

  async getQueueSize(appType: string, apiUrl: string, apiKey: string): Promise<number> {
    try {
      const queue = await this.makeRequest<{size?: number; totalRecords?: number}>(appType, apiUrl, apiKey, 'queue');
      return queue.totalRecords || queue.size || 0;
    } catch (error) {
      console.error('Failed to get queue size:', error);
      return 0;
    }
  }
  
  // New methods that use the ConfigManager
  
  /**
   * Makes a request using the app config from the ConfigManager
   * @param appType The app type (e.g., 'sonarr', 'radarr')
   * @param endpoint The API endpoint
   * @param method The HTTP method
   * @param data The data to send (for POST, PUT)
   * @returns The API response
   */
  async makeConfigRequest<T = any>(
    appType: string, 
    endpoint: string, 
    method: string = 'GET', 
    data: any = null
  ): Promise<T | null> {
    try {
      const config = await ConfigManager.getConfig();
      if (!config || !config[appType]) {
        throw new Error(`Configuration for ${appType} not found`);
      }
      
      const appConfig = config[appType];
      
      if (!appConfig.api_url || !appConfig.api_key) {
        throw new Error(`API URL or API Key missing for ${appType}`);
      }
      
      const timeout = appConfig.api_timeout || 120;
      
      return this.makeRequest<T>(
        appType,
        appConfig.api_url,
        appConfig.api_key,
        endpoint,
        method,
        data,
        timeout
      );
    } catch (error) {
      console.error(`Error making ${appType} request to ${endpoint}:`, error);
      return null;
    }
  }
  
  /**
   * Checks connection using the app config from the ConfigManager
   * @param appType The app type (e.g., 'sonarr', 'radarr')
   * @returns Connection status
   */
  async checkConnectionFromConfig(appType: string): Promise<boolean> {
    try {
      const config = await ConfigManager.getConfig();
      if (!config || !config[appType]) return false;
      
      const appConfig = config[appType];
      if (!appConfig.api_url || !appConfig.api_key) return false;
      
      return this.checkConnection(appType, appConfig.api_url, appConfig.api_key);
    } catch (error) {
      console.error(`Error checking ${appType} connection:`, error);
      return false;
    }
  }
  
  /**
   * Gets the queue size using the app config from the ConfigManager
   * @param appType The app type (e.g., 'sonarr', 'radarr')
   * @returns Queue size
   */
  async getQueueSizeFromConfig(appType: string): Promise<number> {
    try {
      const config = await ConfigManager.getConfig();
      if (!config || !config[appType]) return 0;
      
      const appConfig = config[appType];
      if (!appConfig.api_url || !appConfig.api_key) return 0;
      
      return this.getQueueSize(appType, appConfig.api_url, appConfig.api_key);
    } catch (error) {
      console.error(`Error getting ${appType} queue size:`, error);
      return 0;
    }
  }
  
  // App-specific methods
  
  // Sonarr methods
  async getSonarrMissingEpisodes(apiUrl: string, apiKey: string, monitored: boolean = true): Promise<any> {
    return this.makeRequest('sonarr', apiUrl, apiKey, 'wanted/missing', 'GET', { monitored });
  }
  
  async getSonarrCutoffUnmetEpisodes(apiUrl: string, apiKey: string, monitored: boolean = true): Promise<any> {
    return this.makeRequest('sonarr', apiUrl, apiKey, 'wanted/cutoff', 'GET', { monitored });
  }
  
  // Radarr methods
  async getRadarrMissingMovies(apiUrl: string, apiKey: string, monitored: boolean = true): Promise<any> {
    return this.makeRequest('radarr', apiUrl, apiKey, 'movie/lookup', 'GET', { monitored });
  }
  
  async getRadarrCutoffUnmetMovies(apiUrl: string, apiKey: string, monitored: boolean = true): Promise<any> {
    return this.makeRequest('radarr', apiUrl, apiKey, 'wanted/cutoff', 'GET', { monitored });
  }
  
  // Generic command method for all apps
  async sendCommand(appType: string, apiUrl: string, apiKey: string, command: string, params: any = {}): Promise<any> {
    return this.makeRequest(appType, apiUrl, apiKey, 'command', 'POST', {
      name: command,
      ...params
    });
  }
}

export default new ArrApiManager();
