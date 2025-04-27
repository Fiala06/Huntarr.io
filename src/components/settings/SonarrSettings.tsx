import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import ApiSettings from './ApiSettings';
import HuntSettings from './HuntSettings';
import AdvancedSettings from './AdvancedSettings';

const SonarrSettings: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  
  if (isLoading || !settings) {
    return <div>Loading settings...</div>;
  }

  const sonarrSettings = settings.sonarr || {};
  
  const handleApiUrlChange = (value: string) => {
    updateSettings('sonarr', { ...sonarrSettings, api_url: value });
  };
  
  const handleApiKeyChange = (value: string) => {
    updateSettings('sonarr', { ...sonarrSettings, api_key: value });
  };
  
  const handleHuntMissingChange = (value: number) => {
    updateSettings('sonarr', { ...sonarrSettings, hunt_missing_shows: value });
  };
  
  const handleHuntUpgradeChange = (value: number) => {
    updateSettings('sonarr', { ...sonarrSettings, hunt_upgrade_episodes: value });
  };
  
  const handleIntervalChange = (value: number) => {
    updateSettings('sonarr', { ...sonarrSettings, sleep_duration: value });
  };
  
  const handleStateResetChange = (value: number) => {
    updateSettings('sonarr', { ...sonarrSettings, state_reset_interval_hours: value });
  };
  
  const handleToggleChange = (field: string, checked: boolean) => {
    updateSettings('sonarr', { ...sonarrSettings, [field]: checked });
  };
  
  const handleAdvancedChange = (field: string, value: any) => {
    updateSettings('sonarr', { ...sonarrSettings, [field]: value });
  };

  return (
    <div className="app-settings">
      <h2 className="settings-title">Sonarr Settings</h2>
      
      <ApiSettings 
        appName="sonarr"
        apiUrl={sonarrSettings.api_url || ''}
        apiKey={sonarrSettings.api_key || ''}
        onApiUrlChange={handleApiUrlChange}
        onApiKeyChange={handleApiKeyChange}
      />
      
      <HuntSettings
        appName="sonarr"
        huntMissing={sonarrSettings.hunt_missing_shows || 0}
        huntUpgrade={sonarrSettings.hunt_upgrade_episodes || 0}
        interval={sonarrSettings.sleep_duration || 900}
        stateReset={sonarrSettings.state_reset_interval_hours || 168}
        monitoredOnly={sonarrSettings.monitored_only !== false}
        skipFutureReleases={sonarrSettings.skip_future_episodes !== false}
        skipRefresh={sonarrSettings.skip_series_refresh !== false}
        randomMissing={sonarrSettings.random_missing !== false}
        randomUpgrades={sonarrSettings.random_upgrades !== false}
        onHuntMissingChange={handleHuntMissingChange}
        onHuntUpgradeChange={handleHuntUpgradeChange}
        onIntervalChange={handleIntervalChange}
        onStateResetChange={handleStateResetChange}
        onToggleChange={handleToggleChange}
      />
      
      <AdvancedSettings
        appName="sonarr"
        settings={sonarrSettings}
        onSettingChange={handleAdvancedChange}
      />
    </div>
  );
};

export default SonarrSettings;