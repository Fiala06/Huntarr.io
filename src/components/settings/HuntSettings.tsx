import React from 'react';

interface HuntSettingsProps {
  appName: string;
  huntMissing: number;
  huntUpgrade: number;
  interval: number;
  stateReset: number;
  monitoredOnly: boolean;
  skipFutureReleases: boolean;
  skipRefresh: boolean;
  randomMissing: boolean;
  randomUpgrades: boolean;
  onHuntMissingChange: (value: number) => void;
  onHuntUpgradeChange: (value: number) => void;
  onIntervalChange: (value: number) => void;
  onStateResetChange: (value: number) => void;
  onToggleChange: (field: string, value: boolean) => void;
}

const HuntSettings: React.FC<HuntSettingsProps> = ({
  appName,
  huntMissing,
  huntUpgrade,
  interval,
  stateReset,
  monitoredOnly,
  skipFutureReleases,
  skipRefresh,
  randomMissing,
  randomUpgrades,
  onHuntMissingChange,
  onHuntUpgradeChange,
  onIntervalChange,
  onStateResetChange,
  onToggleChange
}) => {
  const capitalized = appName.charAt(0).toUpperCase() + appName.slice(1);
  
  // Define labels based on app type
  const missingItemsLabel = appName === 'sonarr' ? 'Missing Shows'
    : appName === 'radarr' ? 'Missing Movies'
    : appName === 'lidarr' ? 'Missing Albums'
    : appName === 'readarr' ? 'Missing Books'
    : appName === 'whisparr' ? 'Missing Scenes'
    : 'Missing Items';
    
  const upgradeItemsLabel = appName === 'sonarr' ? 'Episodes to Upgrade'
    : appName === 'radarr' ? 'Movies to Upgrade'
    : appName === 'lidarr' ? 'Albums to Upgrade'
    : appName === 'readarr' ? 'Books to Upgrade'
    : appName === 'whisparr' ? 'Scenes to Upgrade'
    : 'Items to Upgrade';
    
  const skipRefreshLabel = appName === 'sonarr' ? 'Skip Series Refresh'
    : appName === 'radarr' ? 'Skip Movie Refresh'
    : appName === 'lidarr' ? 'Skip Artist Refresh'
    : appName === 'readarr' ? 'Skip Author Refresh'
    : appName === 'whisparr' ? 'Skip Scene Refresh'
    : 'Skip Refresh';

  return (
    <div className="settings-group">
      <h3>Hunt Settings</h3>
      
      <div className="setting-item">
        <label htmlFor={`${appName}HuntMissing`}>{missingItemsLabel}:</label>
        <input 
          type="number" 
          id={`${appName}HuntMissing`} 
          value={huntMissing} 
          onChange={(e) => onHuntMissingChange(parseInt(e.target.value, 10))}
          min="0"
          max="100"
        />
        <div className="setting-help">
          Number of missing items to search per cycle (0 to disable)
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor={`${appName}HuntUpgrade`}>{upgradeItemsLabel}:</label>
        <input 
          type="number" 
          id={`${appName}HuntUpgrade`} 
          value={huntUpgrade} 
          onChange={(e) => onHuntUpgradeChange(parseInt(e.target.value, 10))}
          min="0"
          max="100"
        />
        <div className="setting-help">
          Number of items to upgrade per cycle (0 to disable)
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor={`${appName}Interval`}>Search Interval (seconds):</label>
        <input 
          type="number" 
          id={`${appName}Interval`} 
          value={interval} 
          onChange={(e) => onIntervalChange(parseInt(e.target.value, 10))}
          min="60"
          max="86400"
        />
        <div className="setting-help">
          Time between search cycles in seconds (default: 900 = 15 minutes)
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor={`${appName}StateReset`}>State Reset (hours):</label>
        <input 
          type="number" 
          id={`${appName}StateReset`} 
          value={stateReset} 
          onChange={(e) => onStateResetChange(parseInt(e.target.value, 10))}
          min="1"
          max="720"
        />
        <div className="setting-help">
          Hours between state resets (default: 168 = 7 days)
        </div>
      </div>
      
      <div className="setting-item checkbox-setting">
        <label htmlFor={`${appName}MonitoredOnly`}>
          <input
            type="checkbox"
            id={`${appName}MonitoredOnly`}
            checked={monitoredOnly}
            onChange={(e) => onToggleChange('monitored_only', e.target.checked)}
          />
          <span>Monitored Only</span>
        </label>
        <div className="setting-help">
          Only search for monitored items
        </div>
      </div>
      
      <div className="setting-item checkbox-setting">
        <label htmlFor={`${appName}SkipFutureReleases`}>
          <input
            type="checkbox"
            id={`${appName}SkipFutureReleases`}
            checked={skipFutureReleases}
            onChange={(e) => onToggleChange('skip_future_releases', e.target.checked)}
          />
          <span>Skip Future Releases</span>
        </label>
        <div className="setting-help">
          Skip searching for items with future release dates
        </div>
      </div>
      
      <div className="setting-item checkbox-setting">
        <label htmlFor={`${appName}SkipRefresh`}>
          <input
            type="checkbox"
            id={`${appName}SkipRefresh`}
            checked={skipRefresh}
            onChange={(e) => {
              const field = appName === 'sonarr' ? 'skip_series_refresh'
                : appName === 'radarr' ? 'skip_movie_refresh'
                : appName === 'lidarr' ? 'skip_artist_refresh'
                : appName === 'readarr' ? 'skip_author_refresh'
                : appName === 'whisparr' ? 'skip_scene_refresh'
                : 'skip_refresh';
              onToggleChange(field, e.target.checked);
            }}
          />
          <span>{skipRefreshLabel}</span>
        </label>
        <div className="setting-help">
          Skip refreshing metadata to reduce disk I/O (faster but may miss some updates)
        </div>
      </div>
      
      <div className="setting-item checkbox-setting">
        <label htmlFor={`${appName}RandomMissing`}>
          <input
            type="checkbox"
            id={`${appName}RandomMissing`}
            checked={randomMissing}
            onChange={(e) => onToggleChange('random_missing', e.target.checked)}
          />
          <span>Random Missing Items</span>
        </label>
        <div className="setting-help">
          Select random missing items instead of sequential processing
        </div>
      </div>
      
      <div className="setting-item checkbox-setting">
        <label htmlFor={`${appName}RandomUpgrades`}>
          <input
            type="checkbox"
            id={`${appName}RandomUpgrades`}
            checked={randomUpgrades}
            onChange={(e) => onToggleChange('random_upgrades', e.target.checked)}
          />
          <span>Random Upgrades</span>
        </label>
        <div className="setting-help">
          Select random items for quality upgrades
        </div>
      </div>
    </div>
  );
};

export default HuntSettings;