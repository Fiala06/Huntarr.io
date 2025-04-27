import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import SonarrSettings from '../components/settings/SonarrSettings';
import RadarrSettings from '../components/settings/RadarrSettings';
import LidarrSettings from '../components/settings/LidarrSettings';
import ReadarrSettings from '../components/settings/ReadarrSettings';
import WhisparrSettings from '../components/settings/WhisparrSettings';
import GeneralSettings from '../components/settings/GeneralSettings';
import Button from '../components/common/Button';

const SettingsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('sonarr');
  const { saveSettings, resetSettings, hasUnsavedChanges, isLoading } = useSettings();

  const handleSaveSettings = async () => {
    await saveSettings(currentTab);
  };

  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset these settings to default values?')) {
      await resetSettings(currentTab);
    }
  };

  const renderSettingsPanel = () => {
    switch(currentTab) {
      case 'sonarr': return <SonarrSettings />;
      case 'radarr': return <RadarrSettings />;
      case 'lidarr': return <LidarrSettings />;
      case 'readarr': return <ReadarrSettings />;
      case 'whisparr': return <WhisparrSettings />;
      case 'general': return <GeneralSettings />;
      default: return <SonarrSettings />;
    }
  };

  return (
    <div className="content-section" id="settingsSection">
      <div className="section-header">
        <div className="settings-tabs">
          <button 
            className={`settings-tab ${currentTab === 'sonarr' ? 'active' : ''}`} 
            data-settings="sonarr" 
            onClick={() => setCurrentTab('sonarr')}>
            Sonarr
          </button>
          <button 
            className={`settings-tab ${currentTab === 'radarr' ? 'active' : ''}`} 
            data-settings="radarr" 
            onClick={() => setCurrentTab('radarr')}>
            Radarr
          </button>
          <button 
            className={`settings-tab ${currentTab === 'lidarr' ? 'active' : ''}`} 
            data-settings="lidarr" 
            onClick={() => setCurrentTab('lidarr')}>
            Lidarr
          </button>
          <button 
            className={`settings-tab ${currentTab === 'readarr' ? 'active' : ''}`} 
            data-settings="readarr" 
            onClick={() => setCurrentTab('readarr')}>
            Readarr
          </button>
          <button 
            className={`settings-tab ${currentTab === 'whisparr' ? 'active' : ''}`} 
            data-settings="whisparr" 
            onClick={() => setCurrentTab('whisparr')}>
            Whisparr
          </button>
          <button 
            className={`settings-tab ${currentTab === 'general' ? 'active' : ''}`} 
            data-settings="general" 
            onClick={() => setCurrentTab('general')}>
            General
          </button>
        </div>
        
        <div className="settings-actions">
          <Button 
            variant="success"
            icon="fa-save"
            iconPosition="left"
            id="saveSettingsButton" 
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges(currentTab)}
            isLoading={isLoading}
          >
            Save
          </Button>
          <Button 
            variant="danger"
            icon="fa-undo"
            iconPosition="left"
            id="resetSettingsButton" 
            onClick={handleResetSettings}
          >
            Reset
          </Button>
        </div>
      </div>
      
      <div className="settings-form">
        {renderSettingsPanel()}
      </div>
    </div>
  );
};

export default SettingsPage;
