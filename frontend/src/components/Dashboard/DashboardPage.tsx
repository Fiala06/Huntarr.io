import React, { useState, useEffect } from 'react';
import { useTheme } from '../../components/ThemeProvider';
import { AllStats, AppStats } from '../../types';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState<AllStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to load statistics');
        }
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          throw new Error(data.error || 'Failed to load statistics');
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
        setError('Failed to load app statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const resetStats = async () => {
    if (!window.confirm('Are you sure you want to reset all media statistics?')) {
      return;
    }

    try {
      const response = await fetch('/api/stats/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        // Reload stats after reset
        const statsResponse = await fetch('/api/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success && statsData.stats) {
            setStats(statsData.stats);
          }
        }
      } else {
        setError(data.message || 'Failed to reset statistics');
      }
    } catch (error) {
      console.error('Error resetting statistics:', error);
      setError('An error occurred while resetting statistics');
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="main-content">
        <section id="homeSection" className="content-section active">
          <div className="dashboard-grid">
            <div className="card welcome-card">
              <h2>
                <i className="fas fa-home"></i> Welcome to Huntarr
              </h2>
              <p>Your media hunting companion for Sonarr, Radarr, and other *arr applications.</p>
            </div>
            
            <div className="card">
              <h3>
                <i className="fas fa-chart-bar"></i> Media Statistics
              </h3>
              <div className="app-stats-grid">
                {stats && Object.entries(stats).map(([app, appStats]) => (
                  <div key={app} className={`app-stats-card ${app}`}>
                    <div className="app-icon">
                      <img src={`/static/arrs/48-${app}.png`} alt={`${app} Logo`} />
                    </div>
                    <div className="app-content">
                      <img src={`/static/arrs/48-${app}.png`} alt={`${app} Logo`} className="app-logo" />
                      <h4>{app.charAt(0).toUpperCase() + app.slice(1)}</h4>
                    </div>
                    <div className="stats-numbers">
                      <div className="stat-box">
                        <span className="stat-number" id={`${app}-hunted`}>{appStats.hunted}</span>
                        <span className="stat-label">Missing</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-number" id={`${app}-upgraded`}>{appStats.upgraded}</span>
                        <span className="stat-label">Upgrades</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="stats-actions">
                <button id="refresh-stats" className="action-button">
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
                <button id="reset-stats" className="action-button danger" onClick={resetStats}>
                  <i className="fas fa-trash"></i> Reset
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
