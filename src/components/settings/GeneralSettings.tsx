import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import timezones from '../../data/timezones';

const GeneralSettings: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const [showAllTimezones, setShowAllTimezones] = useState(false);
  
  if (isLoading || !settings) {
    return <div>Loading settings...</div>;
  }

  const generalSettings = settings.general || {};
  
  const handleInputChange = (field: string, value: any) => {
    updateSettings('general', { ...generalSettings, [field]: value });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    handleInputChange(name, checked);
  };
  
  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange('timezone', e.target.value);
  };
  
  // Filter timezones for easier selection
  const commonTimezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Australia/Sydney',
    'Asia/Tokyo'
  ];
  
  const displayTimezones = showAllTimezones 
    ? timezones || [] 
    : timezones?.filter(tz => commonTimezones.includes(tz)) || [];

  return (
    <div className="app-settings">
      <h2 className="settings-title">General Settings</h2>
      
      <div className="settings-group">
        <h3>System Settings</h3>
        
        <div className="setting-item">
          <label htmlFor="timezone">Timezone:</label>
          <select
            id="timezone"
            name="timezone"
            value={generalSettings.timezone || 'UTC'}
            onChange={handleTimezoneChange}
          >
            {displayTimezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          <button 
            className="button-small"
            onClick={() => setShowAllTimezones(!showAllTimezones)}
          >
            {showAllTimezones ? 'Show Common' : 'Show All'}
          </button>
          <div className="setting-help">
            Select your timezone for scheduling and logs
          </div>
        </div>
        
        <div className="setting-item checkbox-setting">
          <label htmlFor="darkMode">
            <input
              type="checkbox"
              id="darkMode"
              name="dark_mode"
              checked={generalSettings.dark_mode || false}
              onChange={handleCheckboxChange}
            />
            <span>Dark Mode</span>
          </label>
          <div className="setting-help">
            Use dark theme for the user interface
          </div>
        </div>
        
        <div className="setting-item checkbox-setting">
          <label htmlFor="autoUpdate">
            <input
              type="checkbox"
              id="autoUpdate"
              name="auto_update"
              checked={generalSettings.auto_update || false}
              onChange={handleCheckboxChange}
            />
            <span>Auto-Update</span>
          </label>
          <div className="setting-help">
            Automatically update Huntarr when new versions are available
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
