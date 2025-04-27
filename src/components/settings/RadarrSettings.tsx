import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import ApiSettings from './ApiSettings';
import HuntSettings from './HuntSettings';
import AdvancedSettings from './AdvancedSettings';

const RadarrSettings: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  
  if (isLoading || !settings) {
    return <div>Loading settings...</div>;
  }

  const radarrSettings = settings.radarr || {};
  
  const handleApiUrlChange = (value: string) => {
    updateSettings('radarr', { ...radarrSettings, api_url: value });
  };
  
  const handleApiKeyChange = (value: string) => {
    updateSettings('radarr', { ...radarrSettings, api_key: value });
  };
  
  const handleHuntMissingChange = (value: number) => {
    updateSettings('radarr', { ...radarrSettings, hunt_missing_movies: value });
  };
  
  const handleHuntUpgradeChange = (value: number) => {
    updateSettings('radarr', { ...radarrSettings, hunt_upgrade_movies: value });
  };
  
  const handleIntervalChange = (value: number) => {
    updateSettings('radarr', { ...radarrSettings, sleep_duration: value });
  };
  
  const handleStateResetChange = (value: number) => {
    updateSettings('radarr', { ...radarrSettings, state_reset_interval_hours: value });
  };
  
  const handleToggleChange = (field: string, checked: boolean) => {
    updateSettings('radarr', { ...radarrSettings, [field]: checked });
  };
  
  const handleAdvancedChange = (field: string, value: any) => {
    updateSettings('radarr', { ...radarrSettings, [field]: value });
  };

  return (
    <div className="app-settings">
      <h2 className="settings-title">Radarr Settings</h2>
      
      <ApiSettings 
        appName="radarr"
        apiUrl={radarrSettings.api_url || ''}
        apiKey={radarrSettings.api_key || ''}
        onApiUrlChange={handleApiUrlChange}
        onApiKeyChange={handleApiKeyChange}
      />
      
      <HuntSettings
        appName="radarr"
        huntMissing={radarrSettings.hunt_missing_movies || 0}
        huntUpgrade={radarrSettings.hunt_upgrade_movies || 0}
        interval={radarrSettings.sleep_duration || 900}
        stateReset={radarrSettings.state_reset_interval_hours || 168}
        monitoredOnly={radarrSettings.monitored_only !== false}
        skipFutureReleases={radarrSettings.skip_future_releases !== false}
        skipRefresh={radarrSettings.skip_movie_refresh !== false}
        randomMissing={radarrSettings.random_missing !== false}
        randomUpgrades={radarrSettings.random_upgrades !== false}
        onHuntMissingChange={handleHuntMissingChange}
        onHuntUpgradeChange={handleHuntUpgradeChange}
        onIntervalChange={handleIntervalChange}
        onStateResetChange={handleStateResetChange}
        onToggleChange={handleToggleChange}
      />
      
      <AdvancedSettings
        appName="radarr"
        settings={radarrSettings}
        onSettingChange={handleAdvancedChange}
      />
    </div>
  );
};

export default RadarrSettings;