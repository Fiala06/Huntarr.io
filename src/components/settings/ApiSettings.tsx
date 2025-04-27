import React, { useState } from 'react';
import { useNotification } from '../../hooks/useNotification';

interface ApiSettingsProps {
  appName: string;
  apiUrl: string;
  apiKey: string;
  instanceId?: string;
  onApiUrlChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
}

// Helper function to get default port based on app name
function getDefaultPort(appName: string): number {
  switch (appName.toLowerCase()) {
    case 'sonarr': return 8989;
    case 'radarr': return 7878;
    case 'lidarr': return 8686;
    case 'readarr': return 8787;
    case 'whisparr': return 6969;
    default: return 8080;
  }
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ 
  appName,
  apiUrl,
  apiKey,
  instanceId,
  onApiUrlChange,
  onApiKeyChange
}) => {
  const { showNotification } = useNotification();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);
  const capitalized = appName.charAt(0).toUpperCase() + appName.slice(1);
  
  const handleTestConnection = async () => {
    if (!apiUrl || !apiKey) {
      showNotification('API URL and API Key are required', 'error');
      return;
    }
    
    setIsTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      const response = await fetch(`/api/status/${appName}`);
      const data = await response.json();
      
      if (data.connected) {
        setConnectionStatus('success');
        showNotification(`Successfully connected to ${capitalized}`, 'success');
      } else if (data.configured && !data.connected) {
        setConnectionStatus('error');
        showNotification(`Failed to connect to ${capitalized}. Check URL and API Key.`, 'error');
      } else {
        setConnectionStatus('error');
        showNotification(`Invalid configuration for ${capitalized}`, 'error');
      }
    } catch (error) {
      setConnectionStatus('error');
      showNotification(`Error testing connection: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleAutoDetect = () => {
    // Default local URL pattern with correct port per app
    const defaultPort = getDefaultPort(appName);
    const defaultUrl = `http://localhost:${defaultPort}`;
    onApiUrlChange(defaultUrl);
  };

  return (
    <div className="settings-group">
      <h3>API Configuration</h3>
      
      <div className="setting-item">
        <label htmlFor={`${appName}ApiUrl`}>API URL:</label>
        <div className="input-with-button">
          <input 
            type="text" 
            id={`${appName}ApiUrl`} 
            value={apiUrl} 
            onChange={(e) => onApiUrlChange(e.target.value)}
            placeholder={`e.g., http://localhost:${getDefaultPort(appName)}`}
          />
          <button 
            className="button-secondary button-small"
            onClick={handleAutoDetect}
            type="button"
          >
            Auto
          </button>
        </div>
        <div className="setting-help">
          {`The URL to your ${capitalized} instance`}
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor={`${appName}ApiKey`}>API Key:</label>
        <input 
          type="password" 
          id={`${appName}ApiKey`} 
          value={apiKey} 
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Your API key"
        />
        <div className="setting-help">
          {`The API key for your ${capitalized} instance (found in ${capitalized} settings)`}
        </div>
      </div>
      
      <div className="setting-actions">
        <button
          className="button-primary"
          onClick={handleTestConnection}
          disabled={isTestingConnection || !apiUrl || !apiKey}
        >
          {isTestingConnection ? 'Testing...' : 'Test Connection'}
        </button>
        
        {connectionStatus === 'success' && (
          <span className="connection-status success">Connection successful</span>
        )}
        
        {connectionStatus === 'error' && (
          <span className="connection-status error">Connection failed</span>
        )}
      </div>
    </div>
  );
};

export default ApiSettings;
