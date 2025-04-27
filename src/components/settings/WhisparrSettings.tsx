import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import ApiSettings from './ApiSettings';
import HuntSettings from './HuntSettings';
import AdvancedSettings from './AdvancedSettings';

const WhisparrSettings: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  
  if (isLoading || !settings) {
    return <div>Loading settings...</div>;
  }

  const whisparrSettings = settings.whisparr || {};
  
  const handleApiUrlChange = (value: string) => {
    updateSettings('whisparr', { ...whisparrSettings, api_url: value });
  };
  
  const handleApiKeyChange = (value: string) => {
    updateSettings('whisparr', { ...whisparrSettings, api_key: value });
  };
  
  const handleHuntMissingChange = (value: number) => {
    updateSettings('whisparr', { ...whisparrSettings, hunt_missing_scenes: value });
  };
  
  const handleHuntUpgradeChange = (value: number) => {
    updateSettings('whisparr', { ...whisparrSettings, hunt_upgrade_scenes: value });
  };
  
  const handleIntervalChange = (value: number) => {
    updateSettings('whisparr', { ...whisparrSettings, sleep_duration: value });
  };
  
  const handleStateResetChange = (value: number) => {
    updateSettings('whisparr', { ...whisparrSettings, state_reset_interval_hours: value });
  };
  
  const handleToggleChange = (field: string, checked: boolean) => {
    updateSettings('whisparr', { ...whisparrSettings, [field]: checked });
  };
  
  const handleAdvancedChange = (field: string, value: any) => {
    updateSettings('whisparr', { ...whisparrSettings, [field]: value });
  };

  return (
    <div className="app-settings">
      <h2 className="settings-title">Whisparr Settings</h2>
      
      <ApiSettings 
        appName="whisparr"
        apiUrl={whisparrSettings.api_url || ''}
        apiKey={whisparrSettings.api_key || ''}
        onApiUrlChange={handleApiUrlChange}
        onApiKeyChange={handleApiKeyChange}
      />
      
      <HuntSettings
        appName="whisparr"
        huntMissing={whisparrSettings.hunt_missing_scenes || 0}
        huntUpgrade={whisparrSettings.hunt_upgrade_scenes || 0}
        interval={whisparrSettings.sleep_duration || 900}
        stateReset={whisparrSettings.state_reset_interval_hours || 168}
        monitoredOnly={whisparrSettings.monitored_only !== false}
        skipFutureReleases={whisparrSettings.skip_future_releases !== false}
        skipRefresh={whisparrSettings.skip_scene_refresh !== false}
        randomMissing={whisparrSettings.random_missing !== false}
        randomUpgrades={whisparrSettings.random_upgrades !== false}
        onHuntMissingChange={handleHuntMissingChange}
        onHuntUpgradeChange={handleHuntUpgradeChange}
        onIntervalChange={handleIntervalChange}
        onStateResetChange={handleStateResetChange}
        onToggleChange={handleToggleChange}
      />
      
      <AdvancedSettings
        appName="whisparr"
        settings={whisparrSettings}
        onSettingChange={handleAdvancedChange}
      />
    </div>
  );
};

export default WhisparrSettings;