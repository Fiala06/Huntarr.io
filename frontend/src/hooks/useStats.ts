import { useState, useEffect, useCallback } from 'react';
import { useNotification } from './useNotification';

interface AppStats {
  hunted: number;
  upgraded: number;
  [key: string]: any;
}

interface StatsData {
  sonarr?: AppStats;
  radarr?: AppStats;
  lidarr?: AppStats;
  readarr?: AppStats;
  whisparr?: AppStats;
  [key: string]: AppStats | undefined;
}

export function useStats() {
  const [stats, setStats] = useState<StatsData>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        console.error('Failed to load statistics:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetStats = useCallback(async (appType?: string) => {
    const confirmMessage = appType 
      ? `Are you sure you want to reset statistics for ${appType}?` 
      : 'Are you sure you want to reset all media statistics?';
          
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    const requestBody = appType ? { app_type: appType } : {};
    
    try {
      const response = await fetch('/api/stats/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification(data.message || 'Statistics reset successfully', 'success');
        loadStats(); // Refresh the stats display
      } else {
        showNotification(data.message || 'Failed to reset statistics', 'error');
      }
    } catch (error) {
      console.error('Error resetting statistics:', error);
      showNotification('Error resetting statistics', 'error');
    }
  }, [showNotification, loadStats]);

  // Load stats on component mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, isLoading, loadStats, resetStats };
}

export default useStats;
