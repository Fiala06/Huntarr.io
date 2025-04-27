import React, { useState } from 'react';

interface AdvancedSettingsProps {
  appName: string;
  settings: Record<string, any>;
  onSettingChange: (field: string, value: any) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ 
  appName,
  settings,
  onSettingChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleNumberChange = (field: string, value: string) => {
    onSettingChange(field, parseInt(value, 10));
  };
  
  const handleCheckboxChange = (field: string, checked: boolean) => {
    onSettingChange(field, checked);
  };
  
  if (!showAdvanced) {
    return (
      <div className="settings-group">
        <h3>Advanced Settings</h3>
        <button 
          className="button-secondary"
          onClick={() => setShowAdvanced(true)}
        >
          Show Advanced Settings
        </button>
      </div>
    );
  }

  return (
    <div className="settings-group">
      <h3>Advanced Settings</h3>
      <button 
        className="button-secondary"
        onClick={() => setShowAdvanced(false)}
      >
        Hide Advanced Settings
      </button>
      
      <div className="setting-item">
        <label htmlFor={`${appName}ApiTimeout`}>API Timeout (seconds):</label>
        <input 
          type="number" 
          id={`${appName}ApiTimeout`} 
          value={settings.api_timeout || 120} 
          onChange={(e) => handleNumberChange('api_timeout', e.target.value)}
          min="30"
          max="600"
        />
        <div className="setting-help">
          Timeout for API requests in seconds (default: 120)
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor={`${appName}CommandWaitDelay`}>Command Wait Delay (seconds):</label>
        <input 
          type="number" 
          id={`${appName}CommandWaitDelay`} 
          value={settings.command_wait_delay || 1} 
          onChange={(e) => handleNumberChange('command_wait_delay', e.target.value)}
          min="1"
          max="60"
        />
        <div className="setting-help">
          Delay between checking command status (default: 1 second)
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor={`${appName}CommandWaitAttempts`}>Command Wait Attempts:</label>
        <input 
          type="number" 
          id={`${appName}CommandWaitAttempts`} 
          value={settings.command_wait_attempts || 600} 
          onChange={(e) => handleNumberChange('command_wait_attempts', e.target.value)}
          min="1"
          max="3600"
        />
        <div className="setting-help">
          Maximum number of attempts to wait for command completion (default: 600)
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor={`${appName}MinQueueSize`}>Minimum Download Queue Size:</label>
        <input 
          type="number" 
          id={`${appName}MinQueueSize`} 
          value={settings.minimum_download_queue_size ?? -1} 
          onChange={(e) => handleNumberChange('minimum_download_queue_size', e.target.value)}
          min="-1"
          max="1000"
        />
        <div className="setting-help">
          Pause hunting when download queue has this many items (-1 to disable)
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor={`${appName}LogRefreshInterval`}>Log Refresh Interval (seconds):</label>
        <input 
          type="number" 
          id={`${appName}LogRefreshInterval`} 
          value={settings.log_refresh_interval_seconds || 30} 
          onChange={(e) => handleNumberChange('log_refresh_interval_seconds', e.target.value)}
          min="5"
          max="300"
        />
        <div className="setting-help">
          Seconds between log refreshes in the UI (default: 30)
        </div>
      </div>
      
      <div className="setting-item checkbox-setting">
        <label htmlFor={`${appName}DebugMode`}>
          <input
            type="checkbox"
            id={`${appName}DebugMode`}
            checked={settings.debug_mode === true}
            onChange={(e) => handleCheckboxChange('debug_mode', e.target.checked)}
          />
          <span>Debug Mode</span>
        </label>
        <div className="setting-help">
          Enable verbose logging for this app
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;