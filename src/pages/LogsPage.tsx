import React, { useState } from 'react';
import { useLogs } from '../hooks/useLogs';

const LogsPage: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<string>('all');
  const { 
    logs, 
    isConnected, 
    autoScroll, 
    setAutoScroll, 
    clearLogs,
    logsContainerRef 
  } = useLogs(currentApp);

  const handleAppTabClick = (app: string) => {
    setCurrentApp(app);
  };

  return (
    <div className="content-section" id="logsSection">
      <div className="section-header">
        <div className="log-tabs">
          <button 
            className={`log-tab ${currentApp === 'all' ? 'active' : ''}`} 
            data-app="all" 
            onClick={() => handleAppTabClick('all')}>
            All
          </button>
          <button 
            className={`log-tab ${currentApp === 'sonarr' ? 'active' : ''}`} 
            data-app="sonarr" 
            onClick={() => handleAppTabClick('sonarr')}>
            Sonarr
          </button>
          <button 
            className={`log-tab ${currentApp === 'radarr' ? 'active' : ''}`} 
            data-app="radarr" 
            onClick={() => handleAppTabClick('radarr')}>
            Radarr
          </button>
          <button 
            className={`log-tab ${currentApp === 'lidarr' ? 'active' : ''}`} 
            data-app="lidarr" 
            onClick={() => handleAppTabClick('lidarr')}>
            Lidarr
          </button>
          <button 
            className={`log-tab ${currentApp === 'readarr' ? 'active' : ''}`} 
            data-app="readarr" 
            onClick={() => handleAppTabClick('readarr')}>
            Readarr
          </button>
          <button 
            className={`log-tab ${currentApp === 'whisparr' ? 'active' : ''}`} 
            data-app="whisparr" 
            onClick={() => handleAppTabClick('whisparr')}>
            Whisparr
          </button>
        </div>
        <div className="log-controls">
          <span id="logConnectionStatus" className={isConnected ? 'status-connected' : 'status-disconnected'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <div className="auto-scroll">
            <input 
              type="checkbox" 
              id="autoScrollCheckbox" 
              checked={autoScroll} 
              onChange={(e) => setAutoScroll(e.target.checked)} 
            />
            <label htmlFor="autoScrollCheckbox">Auto-scroll</label>
          </div>
          <button className="clear-button" id="clearLogsButton" onClick={clearLogs}>
            <i className="fas fa-trash"></i> Clear
          </button>
        </div>
      </div>
      
      <div className="logs" id="logsContainer" ref={logsContainerRef}>
        {logs.map((log, index) => (
          <div key={index} className={`log-entry log-${log.level?.toLowerCase() || 'info'}`}>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsPage;
