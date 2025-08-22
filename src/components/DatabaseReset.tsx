import React, { useState, useEffect } from 'react';
import { resetDatabaseToInitialState, checkAdminPrivileges, getDatabaseStats } from '../utils/resetDatabase';
import { toast } from 'react-toastify';

interface DatabaseStats {
  users: number;
  reservations: number;
  slotCaps: number;
  reservationHistory: number;
}

const DatabaseReset: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await checkAdminPrivileges();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const loadDatabaseStats = async () => {
    setLoadingStats(true);
    try {
      const dbStats = await getDatabaseStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Error loading database stats:', error);
      toast.error('Failed to load database statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!isAdmin) {
      toast.error('Only admin users can reset the database');
      return;
    }

    setIsResetting(true);
    try {
      await resetDatabaseToInitialState();
      setShowConfirmDialog(false);
      // Refresh stats after reset
      await loadDatabaseStats();
    } catch (error) {
      console.error('Database reset failed:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const openConfirmDialog = async () => {
    if (!isAdmin) {
      toast.error('Only admin users can reset the database');
      return;
    }
    
    // Load current stats before showing dialog
    await loadDatabaseStats();
    setShowConfirmDialog(true);
  };

  if (!isAdmin) {
    return null; // Don't render for non-admin users
  }

  return (
    <div className="mb-8">
      <div 
        className="backdrop-blur-xl bg-orange-900/20 border border-orange-500/30 rounded-xl p-6"
        style={{
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(154, 52, 18, 0.2)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          borderRadius: '0.75rem'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-200">Database Reset</h3>
              <p className="text-sm text-orange-300/80">Reset all collections to initial state with default users</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadDatabaseStats}
              disabled={loadingStats}
              className="px-4 py-2 bg-blue-600/80 hover:bg-blue-500/80 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-test="load-stats-button"
            >
              {loadingStats ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Load Stats'
              )}
            </button>
            
            <button
              onClick={openConfirmDialog}
              disabled={isResetting}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              data-test="reset-database-button"
            >
              {isResetting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Resetting...</span>
                </div>
              ) : (
                'Reset Database'
              )}
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.users}</div>
              <div className="text-xs text-slate-300">Users</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.reservations}</div>
              <div className="text-xs text-slate-300">Reservations</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.slotCaps}</div>
              <div className="text-xs text-slate-300">Slot Caps</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.reservationHistory}</div>
              <div className="text-xs text-slate-300">History</div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-200">Warning: This action cannot be undone</p>
              <p className="text-xs text-yellow-300/80 mt-1">
                This will permanently delete all users, reservations, and other data, then recreate default users.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50
          }}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.9))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '28rem',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Confirm Database Reset</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-slate-300 mb-4">
                Are you sure you want to reset the database? This will:
              </p>
              <ul className="text-sm text-slate-400 space-y-2 ml-4">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>Delete all {stats?.users || 0} users (except current admin)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>Delete all {stats?.reservations || 0} reservations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>Clear all slot capacity data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Create default users (admin, user1, user2, manager)</span>
                </li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isResetting}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                data-test="cancel-reset-button"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDatabase}
                disabled={isResetting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                data-test="confirm-reset-button"
              >
                {isResetting ? 'Resetting...' : 'Reset Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseReset;