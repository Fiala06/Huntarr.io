import { useState, useEffect, useCallback, useRef } from 'react';

interface LogEntry {
  level: string;
  message: string;
  timestamp?: string;
}

export const useLogs = (currentApp: string = 'all') => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);
  
  const connectToLogs = useCallback(() => {
    // Close any existing event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const eventSource = new EventSource(`/logs?app=${currentApp}`);
      
      eventSource.onopen = () => {
        setIsConnected(true);
      };
      
      eventSource.onmessage = (event) => {
        try {
          // Try to parse the data as JSON first
          let logData: LogEntry;
          try {
            logData = JSON.parse(event.data);
          } catch (e) {
            // Not JSON, use as plain text
            logData = { level: 'info', message: event.data };
          }
          
          setLogs(prev => [...prev, logData]);
          
          // Auto-scroll if enabled
          if (autoScroll && logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
          }
        } catch (error) {
          console.error('Error processing log message:', error);
        }
      };
      
      eventSource.onerror = () => {
        setIsConnected(false);
        
        // Close the potentially broken source
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          connectToLogs();
        }, 5000);
      };
      
      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Error connecting to event source:', error);
      setIsConnected(false);
    }
  }, [currentApp, autoScroll]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const disconnectLogs = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Connect to logs on mount and when currentApp changes
  useEffect(() => {
    connectToLogs();
    
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [currentApp, connectToLogs]);

  return { 
    logs, 
    isConnected, 
    autoScroll, 
    setAutoScroll, 
    clearLogs, 
    disconnectLogs,
    logsContainerRef
  };
};
