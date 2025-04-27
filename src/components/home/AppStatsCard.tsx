import React, { useState, useEffect, useRef } from 'react';

interface AppStats {
  hunted: number;
  upgraded: number;
}

interface AppStatsCardProps {
  app: string;
  name: string;
  logo: string;
  stats?: AppStats;
  isLoading: boolean;
}

const AppStatsCard: React.FC<AppStatsCardProps> = ({ app, name, logo, stats, isLoading }) => {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const huntedRef = useRef<HTMLSpanElement>(null);
  const upgradedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Check connection status
    fetch(`/api/${app}/status`)
      .then(response => response.json())
      .then(data => {
        setConnected(data.connected === true);
      })
      .catch(() => {
        setConnected(false);
      });

    // Preload logo
    const img = new Image();
    img.src = logo;
    img.onload = () => setLogoLoaded(true);
  }, [app, logo]);

  // Animate number change
  useEffect(() => {
    if (!stats) return;
    
    const animateNumber = (element: HTMLSpanElement | null, targetValue: number) => {
      if (!element) return;
      
      const start = parseInt(element.textContent || '0', 10);
      const end = targetValue;
      const duration = 1000;
      const startTime = performance.now();
      
      const updateNumber = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function
        const easeOutQuad = progress * (2 - progress);
        
        const currentValue = Math.floor(start + (end - start) * easeOutQuad);
        if (element) element.textContent = String(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          if (element) element.textContent = String(end);
        }
      };
      
      requestAnimationFrame(updateNumber);
    };
    
    animateNumber(huntedRef.current, stats.hunted || 0);
    animateNumber(upgradedRef.current, stats.upgraded || 0);
  }, [stats]);

  return (
    <div className={`app-stats-card ${app}`}>
      <div className="status-container">
        {isLoading ? (
          <span className="status-badge loading">
            <i className="fas fa-spinner fa-spin"></i> Loading...
          </span>
        ) : connected === true ? (
          <span className="status-badge connected">
            <i className="fas fa-check-circle"></i> Connected
          </span>
        ) : connected === false ? (
          <span className="status-badge not-connected">
            <i className="fas fa-times-circle"></i> Not Connected
          </span>
        ) : (
          <span className="status-badge loading">
            <i className="fas fa-spinner fa-spin"></i> Loading...
          </span>
        )}
      </div>
      <div className="app-content">
        <img 
          src={logo} 
          alt={`${name} Logo`} 
          className={`app-logo ${logoLoaded ? 'loaded' : ''}`} 
        />
        <h4>{name}</h4>
      </div>
      <div className="stats-numbers">
        <div className="stat-box">
          <span className="stat-number" id={`${app}-hunted`} ref={huntedRef}>
            {stats?.hunted || 0}
          </span>
          <span className="stat-label">Missing</span>
        </div>
        <div className="stat-box">
          <span className="stat-number" id={`${app}-upgraded`} ref={upgradedRef}>
            {stats?.upgraded || 0}
          </span>
          <span className="stat-label">Upgrades</span>
        </div>
      </div>
    </div>
  );
};

export default AppStatsCard;
