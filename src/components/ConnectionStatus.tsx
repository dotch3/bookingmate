import React, { useState, useEffect } from 'react';
import { checkFirestoreConnection } from '../firebase/firebaseUtils';

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

  // Check Firestore connection when online status changes
  useEffect(() => {
    if (isOnline) {
      const checkConnection = async () => {
        const connected = await checkFirestoreConnection();
        setDbConnected(connected);
      };
      
      checkConnection();
      
      // Set up periodic connection checks
      const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    } else {
      setDbConnected(false);
    }
  }, [isOnline]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const connected = await checkFirestoreConnection();
      setDbConnected(connected);
    } catch (error) {
      console.error('Error checking connection:', error);
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
          <span>Database connection error. </span>
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