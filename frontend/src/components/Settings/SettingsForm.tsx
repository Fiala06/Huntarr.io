import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../types';
import ToggleSwitch from '../Common/ToggleSwitch';
import './SettingsForm.css';

interface SettingsFormProps {
  appName: string;
  initialSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ appName, initialSettings, onSave }) => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  
  useEffect(() => {
    setSettings(initialSettings);
    setHasChanges(false);
  }, [initialSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    let newValue: any = value;
    
    // Extract the key name by removing the app prefix
    const key = id.startsWith(`${appName}_`) ? id.substring(appName.length + 1) : id;
    
    // Handle specific input types
    if (type === 'number') {
      newValue = parseInt(value, 10);
    } else if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }
    
    setSettings(prev => ({
      ...prev,
      [key]: newValue
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
  };

  const renderTextField = (label: string, id: string, value: string, help: string) => (
    <div className="setting-item">
      <label htmlFor={id}>{label}:</label>
      <input 
        type="text" 
        id={id} 
        value={value || ''} 
        onChange={handleInputChange}
      />
      <p className="setting-help">{help}</p>
    </div>
  );

  const renderNumberField = (label: string, id: string, value: number, help: string, min?: number, max?: number) => (
    <div className="setting-item">
      <label htmlFor={id}>{label}:</label>
      <input 
        type="number" 
        id={id} 
        min={min} 
        max={max}
        value={value || 0} 
        onChange={handleInputChange}
      />
      <p className="setting-help">{help}</p>
    </div>
  );

  const renderToggle = (label: string, id: string, checked: boolean, help: string) => (
    <div className="setting-item">
      <label htmlFor={id}>{label}:</label>
      <ToggleSwitch 
        id={id}
        checked={checked !== false}
        onChange={handleInputChange}
      />
      <p className="setting-help">{help}</p>
    </div>
  );

  // Common connection settings for all apps
  const renderConnectionSettings = () => (
    <div className="settings-group">
      <h3>{appName.charAt(0).toUpperCase() + appName.slice(1)} Connection</h3>
      {renderTextField(
        "URL", 
        `${appName}_api_url`, 
        settings.api_url || '', 
        `Base URL for ${appName.charAt(0).toUpperCase() + appName.slice(1)} (e.g., http://localhost:8989)`
      )}
      {renderTextField(
        "API Key", 
        `${appName}_api_key`, 
        settings.api_key || '', 
        `API key for ${appName.charAt(0).toUpperCase() + appName.slice(1)}`
      )}
    </div>
  );

  // Common search settings
  const renderSearchSettings = () => (
    <div className="settings-group">
      <h3>Search Settings</h3>
      {renderNumberField(
        "Missing Items to Search", 
        `hunt_missing_${appName === 'sonarr' ? 'shows' : appName === 'radarr' ? 'movies' : 'items'}`, 
        settings.hunt_missing || 1, 
        `Number of missing items to search per cycle (0 to disable)`,
        0
      )}
      {renderNumberField(
        "Items to Upgrade", 
        `hunt_upgrade_${appName === 'sonarr' ? 'episodes' : appName === 'radarr' ? 'movies' : 'items'}`, 
        settings.hunt_upgrades || 0, 
        `Number of items to search for quality upgrades per cycle (0 to disable)`,
        0
      )}
      {renderNumberField(
        "Search Interval", 
        `${appName}_sleep_duration`, 
        settings.sleep_duration || 900, 
        `Time between searches in seconds`,
        60
      )}
      {renderNumberField(
        "Reset Interval", 
        `${appName}_state_reset_interval_hours`, 
        settings.state_reset_interval_hours || 168, 
        `Hours between state resets (default: 168 = 7 days)`,
        1
      )}
    </div>
  );

  // Common options for all apps
  const renderCommonOptions = () => (
    <div className="settings-group">
      <h3>Additional Options</h3>
      {renderToggle(
        "Monitored Only", 
        `${appName}_monitored_only`, 
        settings.monitored_only !== false, 
        "Only search for monitored items"
      )}
      {renderToggle(
        "Skip Future Releases", 
        `${appName}_skip_future_releases`, 
        settings.skip_future_episodes !== false, 
        `Skip searching for items with future release dates`
      )}
    </div>
  );

  // Common advanced options
  const renderAdvancedSettings = () => (
    <div className="settings-group">
      <h3>Advanced Settings</h3>
      {renderToggle(
        "Random Missing", 
        `${appName}_random_missing`, 
        settings.random_missing !== false, 
        "Select random missing items instead of sequential order"
      )}
      {renderToggle(
        "Random Upgrades", 
        `${appName}_random_upgrades`, 
        settings.random_upgrades !== false, 
        "Select random items for quality upgrades"
      )}
      {renderToggle(
        "Debug Mode", 
        `${appName}_debug_mode`, 
        settings.debug_mode === true, 
        "Enable verbose logging for troubleshooting"
      )}
      {renderNumberField(
        "API Timeout", 
        `${appName}_api_timeout`, 
        settings.api_timeout || 60, 
        "Timeout for API requests in seconds",
        10, 300
      )}
      {renderNumberField(
        "Min Download Queue Size", 
        `${appName}_minimum_download_queue_size`, 
        settings.minimum_download_queue_size || -1, 
        "Minimum download queue size to pause searching (-1 to disable)",
        -1
      )}
    </div>
  );

  return (
    <div className="settings-form">
      {renderConnectionSettings()}
      {renderSearchSettings()}
      {renderCommonOptions()}
      {renderAdvancedSettings()}
      
      <div className="settings-actions">
        <button 
          className={`save-button ${!hasChanges ? 'disabled-button' : ''}`}
          disabled={!hasChanges}
          onClick={handleSave}
        >
          <i className="fas fa-save"></i> Save
        </button>
      </div>
    </div>
  );
};

export default SettingsForm;
