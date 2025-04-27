import React, { useState, useEffect } from 'react';

interface ConnectionStatusProps {
  appName: string;
  instanceId?: string;
  apiUrl?: string;
  apiKey?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  appName, 
  instanceId = '0',
  apiUrl,
  apiKey 
}) => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [message, setMessage] = useState<string>('Not tested');
  const [version, setVersion] = useState<string | null>(null);

  const testConnection = async () => {
    if (!apiUrl || !apiKey) {
      setStatus('error');
      setMessage('Missing URL or API key');
      return;
    }

    setStatus('testing');
    setMessage('Testing...');

    try {
      const response = await fetch(`/api/${appName}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_url: apiUrl.trim().replace(/\/+$/, ''),
          api_key: apiKey,
          instance_id: instanceId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('connected');
        setMessage(data.message || 'Connected');
        if (data.version) {
          setVersion(data.version);
        }
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Error');
    }
  };

  useEffect(() => {
    if (apiUrl && apiKey) {
      testConnection();
    }
  }, [apiUrl, apiKey]);

  return (
    <span className={`connection-status ${status}`} id={`${appName}_instance_${instanceId}_status`}>
      {status === 'testing' && <i className="fas fa-spinner fa-spin"></i>}
      {status === 'connected' && <i className="fas fa-check-circle"></i>}
      {status === 'error' && <i className="fas fa-times-circle"></i>}
      {' '}{message}{version ? ` (v${version})` : ''}
    </span>
  );
};

export default ConnectionStatus;
