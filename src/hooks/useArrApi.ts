import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';
import ApiManager from '../services/ApiManager';

interface ArrApiOptions {
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useArrApi(appType: string, apiUrl: string, apiKey: string) {
  const [loading, setLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();

  const makeRequest = useCallback(
    async <T = any>(
      endpoint: string,
      method: string = 'GET',
      data: any = null,
      options: ArrApiOptions = {}
    ): Promise<T | null> => {
      const {
        showSuccessNotification = false,
        showErrorNotification = true,
        successMessage = 'Request successful',
        errorMessage = `Error communicating with ${appType}`
      } = options;

      setLoading(true);

      try {
        const result = await ApiManager.makeRequest<T>(
          appType,
          apiUrl,
          apiKey,
          endpoint,
          method,
          data
        );

        if (showSuccessNotification) {
          showNotification(successMessage, 'success');
        }

        return result;
      } catch (error) {
        if (showErrorNotification) {
          showNotification(
            `${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'error'
          );
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [appType, apiUrl, apiKey, showNotification]
  );

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await ApiManager.checkConnection(appType, apiUrl, apiKey);
      return result;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  }, [appType, apiUrl, apiKey]);

  const getQueueSize = useCallback(async (): Promise<number> => {
    setLoading(true);
    try {
      return await ApiManager.getQueueSize(appType, apiUrl, apiKey);
    } catch (error) {
      return 0;
    } finally {
      setLoading(false);
    }
  }, [appType, apiUrl, apiKey]);

  // Add app-specific methods based on app type
  const getAppSpecificMethods = () => {
    switch (appType.toLowerCase()) {
      case 'sonarr':
        return {
          getMissingEpisodes: (monitored: boolean = true) => 
            makeRequest('wanted/missing', 'GET', { monitored }),
          getUpgradeEpisodes: (monitored: boolean = true) =>
            makeRequest('wanted/cutoff', 'GET', { monitored }),
          searchEpisode: (episodeId: number) =>
            makeRequest('command', 'POST', { name: 'EpisodeSearch', episodeIds: [episodeId] })
        };
      case 'radarr':
        return {
          getMissingMovies: (monitored: boolean = true) =>
            makeRequest('movie/lookup', 'GET', { monitored }),
          getUpgradeMovies: (monitored: boolean = true) =>
            makeRequest('wanted/cutoff', 'GET', { monitored }),
          searchMovie: (movieId: number) =>
            makeRequest('command', 'POST', { name: 'MoviesSearch', movieIds: [movieId] })
        };
      // Add similar methods for other app types
      default:
        return {};
    }
  };

  return {
    loading,
    makeRequest,
    checkConnection,
    getQueueSize,
    ...getAppSpecificMethods()
  };
}

export default useArrApi;
