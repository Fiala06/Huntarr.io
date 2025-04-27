import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import ApiSettings from './ApiSettings';
import HuntSettings from './HuntSettings';
import AdvancedSettings from './AdvancedSettings';

const LidarrSettings: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  
  if (isLoading || !settings) {
    return <div>Loading settings...</div>;
  }

  const lidarrSettings = settings.lidarr || {};
  
  const handleApiUrlChange = (value: string) => {
    updateSettings('lidarr', { ...lidarrSettings, api_url: value });
  };
  
  const handleApiKeyChange = (value: string) => {
    updateSettings('lidarr', { ...lidarrSettings, api_key: value });
  };
  
  const handleHuntMissingChange = (value: number) => {
    updateSettings('lidarr', { ...lidarrSettings, hunt_missing_items: value });
  };
  
  const handleHuntUpgradeChange = (value: number) => {
    updateSettings('lidarr', { ...lidarrSettings, hunt_upgrade_items: value });
  };
  
  const handleIntervalChange = (value: number) => {
    updateSettings('lidarr', { ...lidarrSettings, sleep_duration: value });
  };
  
  const handleStateResetChange = (value: number) => {
    updateSettings('lidarr', { ...lidarrSettings, state_reset_interval_hours: value });
  };
  
  const handleToggleChange = (field: string, checked: boolean) => {
    updateSettings('lidarr', { ...lidarrSettings, [field]: checked });
  };
  
  const handleAdvancedChange = (field: string, value: any) => {
    updateSettings('lidarr', { ...lidarrSettings, [field]: value });
  };

  return (
    <div className="app-settings">
      <h2 className="settings-title">Lidarr Settings</h2>
      
      <ApiSettings 
        appName="lidarr"
        apiUrl={lidarrSettings.api_url || ''}
        apiKey={lidarrSettings.api_key || ''}
        onApiUrlChange={handleApiUrlChange}
        onApiKeyChange={handleApiKeyChange}
      />
      
      <HuntSettings
        appName="lidarr"
        huntMissing={lidarrSettings.hunt_missing_items || 0}
        huntUpgrade={lidarrSettings.hunt_upgrade_items || 0}
        interval={lidarrSettings.sleep_duration || 900}
        stateReset={lidarrSettings.state_reset_interval_hours || 168}
        monitoredOnly={lidarrSettings.monitored_only !== false}
        skipFutureReleases={lidarrSettings.skip_future_releases !== false}
        skipRefresh={lidarrSettings.skip_artist_refresh !== false}
        randomMissing={lidarrSettings.random_missing !== false}
        randomUpgrades={lidarrSettings.random_upgrades !== false}
        onHuntMissingChange={handleHuntMissingChange}
        onHuntUpgradeChange={handleHuntUpgradeChange}
        onIntervalChange={handleIntervalChange}
        onStateResetChange={handleStateResetChange}
        onToggleChange={handleToggleChange}
      />
      
      <AdvancedSettings
        appName="lidarr"
        settings={lidarrSettings}
        onSettingChange={handleAdvancedChange}
      />
    </div>
  );
};

export default LidarrSettings;