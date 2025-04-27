import { useState, useEffect, useRef, useCallback } from 'react';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  app: string;
}

export function useLogs(app: string = 'all') {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (logsContainerRef.current && autoScroll) {
      const container = logsContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [autoScroll]);

  // Function to clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Set up event source for SSE
  useEffect(() => {
    // Close previous connection if it exists
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Create new connection
    const url = app === 'all' ? '/api/logs/stream' : `/api/logs/stream?app=${app}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => {
      setIsConnected(true);
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
        const newEventSource = new EventSource(url);
        eventSourceRef.current = newEventSource;
        
        newEventSource.onopen = () => {
          setIsConnected(true);
        };
        
        newEventSource.onerror = () => {
          setIsConnected(false);
        };
        
        newEventSource.onmessage = handleMessage;
      }, 5000);
    };
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setLogs(prevLogs => {
          // Keep only the last 1000 log entries to prevent memory issues
          const newLogs = [...prevLogs, data].slice(-1000);
          return newLogs;
        });
      } catch (error) {
        console.error('Error parsing log data:', error);
      }
    };
    
    eventSource.onmessage = handleMessage;
    
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [app]);
  
  // Scroll to bottom whenever logs are updated
  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);
  
  return {
    logs,
    isConnected,
    autoScroll,
    setAutoScroll,
    clearLogs,
    logsContainerRef
  };
}

export default useLogs;
