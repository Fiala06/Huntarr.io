import React from 'react';
import ApiSettings from './ApiSettings';

interface AppInstanceProps {
  appName: string;
  instance: {
    name: string;
    api_url: string;
    api_key: string;
    enabled: boolean;
  };
  instanceId: number;
  isRemovable: boolean;
  onNameChange: (value: string) => void;
  onApiUrlChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onEnabledChange: (value: boolean) => void;
  onRemove: () => void;
}

const AppInstance: React.FC<AppInstanceProps> = ({
  appName,
  instance,
  instanceId,
  isRemovable,
  onNameChange,
  onApiUrlChange,
  onApiKeyChange,
  onEnabledChange,
  onRemove
}) => {
  return (
    <div className="instance-item" data-instance-id={instanceId}>
      <div className="instance-header">
        <h4>Instance {instanceId + 1}: {instance.name || 'Unnamed'}</h4>
        <div className="instance-actions">
          <label className="toggle-switch instance-toggle">
            <input 
              type="checkbox" 
              className="instance-enabled" 
              checked={instance.enabled !== false}
              onChange={(e) => onEnabledChange(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
          {isRemovable && (
            <button 
              type="button" 
              className="remove-instance-btn"
              onClick={onRemove}
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
            value={instance.name || ''}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Instance name"
          />
          <p className="setting-help">Friendly name for this {appName.charAt(0).toUpperCase() + appName.slice(1)} instance</p>
        </div>
        <ApiSettings
          appName={appName}
          apiUrl={instance.api_url}
          apiKey={instance.api_key}
          instanceId={String(instanceId)}
          onApiUrlChange={onApiUrlChange}
          onApiKeyChange={onApiKeyChange}
        />
      </div>
    </div>
  );
};

export default AppInstance;
