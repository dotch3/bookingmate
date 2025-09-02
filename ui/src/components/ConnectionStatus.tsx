import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbConnected, setDbConnected] = useState(true);
  const [retrying, setRetrying] = useState(false);

  // Monitor browser online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check API connection when online status changes
  useEffect(() => {
    if (isOnline) {
      const checkConnection = async () => {
        try {
          await apiClient.checkHealth();
          setDbConnected(true);
        } catch (error) {
          console.error('API health check failed:', error);
          setDbConnected(false);
        }
      };
      
      checkConnection();
      
      // Set up periodic connection checks
      const interval = setInterval(checkConnection, 120000); // Check every 2 minutes
      
      return () => clearInterval(interval);
    } else {
      setDbConnected(false);
    }
  }, [isOnline]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await apiClient.checkHealth();
      setDbConnected(true);
    } catch (error) {
      console.error('Error checking API connection:', error);
      setDbConnected(false);
    } finally {
      setRetrying(false);
    }
  };

  if (isOnline && dbConnected) {
    return null; // Don't show anything when everything is working
  }

  return (
    <div className="connection-status">
      {!isOnline && (
        <div className="offline-warning">
          <span>You are offline. Some features may be unavailable.</span>
        </div>
      )}
      {isOnline && !dbConnected && (
        <div className="db-connection-error">
          <span>API connection error. </span>
          <button 
            onClick={handleRetry} 
            disabled={retrying}
            className="retry-button"
          >
            {retrying ? 'Connecting...' : 'Retry Connection'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;