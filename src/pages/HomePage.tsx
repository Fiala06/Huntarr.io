import React from 'react';
import AppStatsCard from '../components/home/AppStatsCard';
import ActionButtons from '../components/home/ActionButtons';
import { useStats } from '../hooks/useStats';
import { useNotification } from '../hooks/useNotification';

const HomePage: React.FC = () => {
  const { stats, isLoading, loadStats, resetStats } = useStats();
  const { showNotification } = useNotification();

  const handleStartHunt = async () => {
    try {
      const response = await fetch('/api/hunt/start', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        showNotification('Hunt started successfully', 'success');
      } else {
        showNotification('Failed to start hunt', 'error');
      }
    } catch (error) {
      console.error('Error starting hunt:', error);
      showNotification('Error starting hunt', 'error');
    }
  };
  
  const handleStopHunt = async () => {
    try {
      const response = await fetch('/api/hunt/stop', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        showNotification('Hunt stopped successfully', 'success');
      } else {
        showNotification('Failed to stop hunt', 'error');
      }
    } catch (error) {
      console.error('Error stopping hunt:', error);
      showNotification('Error stopping hunt', 'error');
    }
  };

  return (
    <div className="content-section active" id="homeSection">
      <div className="dashboard-grid">
        <div className="welcome-card card">
          <h2><i className="fas fa-rocket"></i> Welcome to Huntarr</h2>
          <p>Your all-in-one media hunting companion for the *Arr apps.</p>
          <div className="important-links">
            <a href="https://github.com/sponsors/plexguide" className="link-button">
              <i className="fas fa-heart"></i> Sponsor
            </a>
            <a href="https://github.com/Feramance/Huntarr" className="link-button">
              <i className="fas fa-code-branch"></i> GitHub
            </a>
          </div>
        </div>
        
        <div className="action-card card">
          <h3><i className="fas fa-play-circle"></i> Hunt Control</h3>
          <ActionButtons 
            onStartHunt={handleStartHunt}
            onStopHunt={handleStopHunt}
          />
        </div>

        <div className="media-stats card">
          <h3><i className="fas fa-chart-bar"></i> Media Statistics</h3>
          <div className="media-stats-container">
            <div className="app-stats-grid">
              <AppStatsCard 
                app="sonarr" 
                name="Sonarr" 
                logo="/static/arrs/48-sonarr.png"
                stats={stats.sonarr}
                isLoading={isLoading}
              />
              <AppStatsCard 
                app="radarr" 
                name="Radarr" 
                logo="/static/arrs/48-radarr.png"
                stats={stats.radarr}
                isLoading={isLoading}
              />
              <AppStatsCard 
                app="lidarr" 
                name="Lidarr" 
                logo="/static/arrs/48-lidarr.png"
                stats={stats.lidarr}
                isLoading={isLoading}
              />
              <AppStatsCard 
                app="readarr" 
                name="Readarr" 
                logo="/static/arrs/48-readarr.png"
                stats={stats.readarr}
                isLoading={isLoading}
              />
              <AppStatsCard 
                app="whisparr" 
                name="Whisparr" 
                logo="/static/arrs/48-whisparr.png"
                stats={stats.whisparr}
                isLoading={isLoading}
              />
            </div>
            <div className="stats-actions">
              <button id="refresh-stats" className="action-button" onClick={() => loadStats()}>
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
              <button id="reset-stats" className="action-button danger" onClick={() => resetStats()}>
                <i className="fas fa-trash"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
