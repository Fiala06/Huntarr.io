import React, { useState, useEffect } from 'react';
import MainLayout from '../Layout/MainLayout';
import SettingsForm from './SettingsForm';
import { AllSettings, AppSettings } from '../../types';
import { useApi } from '../../hooks/useApi';
import './SettingsPage.css';

type AppType = 'sonarr' | 'radarr' | 'lidarr' | 'readarr' | 'whisparr' | 'general';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppType>('sonarr');
  const [notification, setNotification] = useState<{ message: string, type: string } | null>(null);

  const { 
    data: allSettings, 
    loading, 
    error, 
    fetchData: loadSettings 
  } = useApi<AllSettings>('/api/settings');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleTabChange = (tab: AppType) => {
    setActiveTab(tab);
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSaveSettings = async (settings: AppSettings) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [activeTab]: settings })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      
      showNotification('Settings saved successfully', 'success');
      
      // Reload settings to ensure UI is up to date with server
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification(error instanceof Error ? error.message : 'Error saving settings', 'error');
    }
  };

  const handleResetSettings = async () => {
    if (!window.confirm('Are you sure you want to reset these settings to default values?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ app: activeTab })
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('Settings reset to defaults', 'success');
        loadSettings(); // Reload settings
      } else {
        showNotification(data.error || 'Error resetting settings', 'error');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      showNotification('Error resetting settings', 'error');
    }
  };

  return (
    <MainLayout title="Settings">
      <div className="settings-container">
        <div className="settings-header">
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeTab === 'sonarr' ? 'active' : ''}`}
              onClick={() => handleTabChange('sonarr')}
            >
              Sonarr
            </button>
            <button 
              className={`settings-tab ${activeTab === 'radarr' ? 'active' : ''}`}
              onClick={() => handleTabChange('radarr')}
            >
              Radarr
            </button>
            <button 
              className={`settings-tab ${activeTab === 'lidarr' ? 'active' : ''}`}
              onClick={() => handleTabChange('lidarr')}
            >
              Lidarr
            </button>
            <button 
              className={`settings-tab ${activeTab === 'readarr' ? 'active' : ''}`}
              onClick={() => handleTabChange('readarr')}
            >
              Readarr
            </button>
            <button 
              className={`settings-tab ${activeTab === 'whisparr' ? 'active' : ''}`}
              onClick={() => handleTabChange('whisparr')}
            >
              Whisparr
            </button>
            <button 
              className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => handleTabChange('general')}
            >
              General
            </button>
          </div>
          
          <div className="settings-actions">
            <button className="reset-button" onClick={handleResetSettings}>
              <i className="fas fa-undo"></i> Reset
            </button>
          </div>
        </div>
        
        <div className="settings-content">
          {loading ? (
            <div className="loading-spinner">Loading settings...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : allSettings ? (
            <SettingsForm 
              appName={activeTab}
              initialSettings={allSettings[activeTab] || {}}
              onSave={handleSaveSettings}
            />
          ) : (
            <div className="error-message">No settings data available</div>
          )}
        </div>
        
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
