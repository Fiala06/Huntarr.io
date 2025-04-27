import React, { useState } from 'react';
import { AppConnection } from '../../types';
import './AppConnectionTest.css';

interface AppConnectionTestProps {
  appName: string;
  instance: AppConnection;
  instanceId: number;
  onUpdate: (instanceId: number, updates: Partial<AppConnection>) => void;
  onRemove: (instanceId: number) => void;
}

interface ConnectionResponse {
  success: boolean;
  message?: string;
  version?: string;
  error?: string;
}

const AppConnectionTest: React.FC<AppConnectionTestProps> = ({ 
  appName, 
  instance, 
  instanceId, 
  onUpdate, 
  onRemove 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<{
    status: 'untested' | 'testing' | 'success' | 'error';
    message: string;
  }>({
    status: 'untested',
    message: 'Not tested'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onUpdate(instanceId, {
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const testConnection = async () => {
    if (!instance.api_url || !instance.api_key) {
      setConnectionStatus({
        status: 'error',
        message: 'Missing URL or API key'
      });
      return;
    }

    setConnectionStatus({
      status: 'testing',
      message: 'Testing...'
    });

    try {
      // Clean up the URL by removing trailing slashes
      const cleanUrl = instance.api_url.trim().replace(/\/+$/, '');
      
      const response = await fetch(`/api/${appName}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_url: cleanUrl,
          api_key: instance.api_key
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data: ConnectionResponse = await response.json();
      
      if (data.success) {
        let statusMessage = data.message || 'Connected';
        if (data.version) {
          statusMessage += ` (v${data.version})`;
        }
        
        setConnectionStatus({
          status: 'success',
          message: statusMessage
        });
      } else {
        setConnectionStatus({
          status: 'error',
          message: data.message || 'Failed'
        });
      }
    } catch (error) {
      console.error(`Error testing connection for ${appName} instance ${instanceId}:`, error);
      setConnectionStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Error'
      });
    }
  };

  return (
    <div className="instance-item" data-instance-id={instanceId}>
      <div className="instance-header">
        <h4>{instance.name || `Instance ${instanceId + 1}`}</h4>
        <div className="instance-actions">
          <label className="toggle-switch instance-toggle">
            <input 
              type="checkbox" 
              name="enabled" 
              checked={instance.enabled !== false} 
              onChange={handleInputChange} 
              className="instance-enabled" 
            />
            <span className="toggle-slider"></span>
          </label>
          {instanceId > 0 && (
            <button 
              type="button" 
              className="remove-instance-btn" 
              onClick={() => onRemove(instanceId)}
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <div className="instance-content">
        <div className="setting-item">
          <label htmlFor={`${appName}_instance_${instanceId}_name`}>Name:</label>
          <input 
            type="text" 
            id={`${appName}_instance_${instanceId}_name`} 
            name="name"
            value={instance.name || ''} 
            onChange={handleInputChange}
          />
          <p className="setting-help">Friendly name for this instance</p>
        </div>
        <div className="setting-item">
          <label htmlFor={`${appName}_instance_${instanceId}_api_url`}>URL:</label>
          <input 
            type="text" 
            id={`${appName}_instance_${instanceId}_api_url`} 
            name="api_url"
            value={instance.api_url || ''} 
            onChange={handleInputChange}
          />
          <p className="setting-help">Base URL (e.g., http://localhost:8989)</p>
        </div>
        <div className="setting-item">
          <label htmlFor={`${appName}_instance_${instanceId}_api_key`}>API Key:</label>
          <input 
            type="text" 
            id={`${appName}_instance_${instanceId}_api_key`} 
            name="api_key"
            value={instance.api_key || ''} 
            onChange={handleInputChange}
          />
          <p className="setting-help">API key for this instance</p>
        </div>
        <div className="instance-status-row">
          <button type="button" className="test-connection-btn" onClick={testConnection}>
            Test Connection
          </button>
          <span 
            id={`${appName}_instance_${instanceId}_status`} 
            className={`connection-status ${connectionStatus.status}`}
          >
            {connectionStatus.message}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppConnectionTest;
