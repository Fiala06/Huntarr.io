import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import ApiSettings from './ApiSettings';
import HuntSettings from './HuntSettings';
import AdvancedSettings from './AdvancedSettings';

const ReadarrSettings: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  
  if (isLoading || !settings) {
    return <div>Loading settings...</div>;
  }

  const readarrSettings = settings.readarr || {};
  
  const handleApiUrlChange = (value: string) => {
    updateSettings('readarr', { ...readarrSettings, api_url: value });
  };
  
  const handleApiKeyChange = (value: string) => {
    updateSettings('readarr', { ...readarrSettings, api_key: value });
  };
  
  const handleHuntMissingChange = (value: number) => {
    updateSettings('readarr', { ...readarrSettings, hunt_missing_books: value });
  };
  
  const handleHuntUpgradeChange = (value: number) => {
    updateSettings('readarr', { ...readarrSettings, hunt_upgrade_books: value });
  };
  
  const handleIntervalChange = (value: number) => {
    updateSettings('readarr', { ...readarrSettings, sleep_duration: value });
  };
  
  const handleStateResetChange = (value: number) => {
    updateSettings('readarr', { ...readarrSettings, state_reset_interval_hours: value });
  };
  
  const handleToggleChange = (field: string, checked: boolean) => {
    updateSettings('readarr', { ...readarrSettings, [field]: checked });
  };
  
  const handleAdvancedChange = (field: string, value: any) => {
    updateSettings('readarr', { ...readarrSettings, [field]: value });
  };

  return (
    <div className="app-settings">
      <h2 className="settings-title">Readarr Settings</h2>
      
      <ApiSettings 
        appName="readarr"
        apiUrl={readarrSettings.api_url || ''}
        apiKey={readarrSettings.api_key || ''}
        onApiUrlChange={handleApiUrlChange}
        onApiKeyChange={handleApiKeyChange}
      />
      
      <HuntSettings
        appName="readarr"
        huntMissing={readarrSettings.hunt_missing_books || 0}
        huntUpgrade={readarrSettings.hunt_upgrade_books || 0}
        interval={readarrSettings.sleep_duration || 900}
        stateReset={readarrSettings.state_reset_interval_hours || 168}
        monitoredOnly={readarrSettings.monitored_only !== false}
        skipFutureReleases={readarrSettings.skip_future_releases !== false}
        skipRefresh={readarrSettings.skip_author_refresh !== false}
        randomMissing={readarrSettings.random_missing !== false}
        randomUpgrades={readarrSettings.random_upgrades !== false}
        onHuntMissingChange={handleHuntMissingChange}
        onHuntUpgradeChange={handleHuntUpgradeChange}
        onIntervalChange={handleIntervalChange}
        onStateResetChange={handleStateResetChange}
        onToggleChange={handleToggleChange}
      />
      
      <AdvancedSettings
        appName="readarr"
        settings={readarrSettings}
        onSettingChange={handleAdvancedChange}
      />
    </div>
  );
};

export default ReadarrSettings;