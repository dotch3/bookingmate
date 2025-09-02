import React, { useState, useEffect } from 'react';
import SetupWizard from './SetupWizard';
import { isFirstTimeSetup } from '../utils/setupWizard';
import { toast } from 'react-toastify';

interface SetupWrapperProps {
  children: React.ReactNode;
}

const SetupWrapper: React.FC<SetupWrapperProps> = ({ children }) => {
  console.log('SetupWrapper: Component is rendering!');
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      console.log('SetupWrapper: Starting setup check...');
      setIsLoading(true);
      
      // Test direct fetch to see what happens
      console.log('SetupWrapper: Testing direct fetch...');
      const directResponse = await fetch('/api/auth/setup/status');
      console.log('SetupWrapper: Direct fetch response status:', directResponse.status);
      const directData = await directResponse.json();
      console.log('SetupWrapper: Direct fetch data:', directData);
      
      const isFirstTime = await isFirstTimeSetup();
      console.log('SetupWrapper: isFirstTime result:', isFirstTime);
      setNeedsSetup(isFirstTime);
      console.log('SetupWrapper: needsSetup set to:', isFirstTime);
    } catch (error) {
      console.error('SetupWrapper: Error checking setup status:', error);
      toast.error('Failed to check setup status');
      setNeedsSetup(false); // Default to not needing setup on error
    } finally {
      setIsLoading(false);
      console.log('SetupWrapper: Setup check complete');
    }
  };

  const handleSetupComplete = async () => {
    // Re-check setup status after completion to ensure backend confirms
    await checkSetupStatus();
  };

  console.log('SetupWrapper render - isLoading:', isLoading, 'needsSetup:', needsSetup);

  // Show loading spinner while checking setup status
  if (isLoading) {
    console.log('SetupWrapper: Rendering loading spinner');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading BookingMate</h2>
          <p className="text-slate-300">Checking system status...</p>
        </div>
      </div>
    );
  }

  // Show setup wizard if first-time setup is needed
  if (needsSetup) {
    console.log('SetupWrapper: Rendering setup wizard');
    return <SetupWizard onSetupComplete={handleSetupComplete} />;
  }

  // Show normal app if setup is not needed
  console.log('SetupWrapper: Rendering normal app');
  return <>{children}</>;
};

export default SetupWrapper;