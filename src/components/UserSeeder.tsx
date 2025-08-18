import React, { useState } from 'react';
import { seedDefaultUsers, isUsersCollectionEmpty, getDefaultUsers } from '../utils/seedUsers';
import { useAuthRole } from '../auth/useAuthRole';
import { toast } from 'react-toastify';

const UserSeeder: React.FC = () => {
  const { isAdmin } = useAuthRole();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isEmpty, setIsEmpty] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Check if users collection is empty
  const checkUsersCollection = async () => {
    try {
      const empty = await isUsersCollectionEmpty();
      setIsEmpty(empty);
      if (empty) {
        toast.info('Users collection is empty and ready for seeding');
      } else {
        toast.info('Users collection already contains data');
      }
    } catch (error) {
      toast.error('Error checking users collection');
      console.error('Error checking users collection:', error);
    }
  };

  // Handle seeding process
  const handleSeedUsers = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can seed users');
      return;
    }

    setIsSeeding(true);
    try {
      const result = await seedDefaultUsers();
      if (result.success) {
        toast.success(result.message);
        setIsEmpty(false); // Update state after successful seeding
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error during user seeding process');
      console.error('Seeding error:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const defaultUsers = getDefaultUsers();

  if (!isAdmin) {
    return null; // Don't show to non-admin users
  }

  return (
    <div 
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            🌱 User Seeding
          </span>
        </h3>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-300">Admin Tool</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={checkUsersCollection}
            className="group inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.6) 100%)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            Check Users Collection
          </button>
          
          <button
            onClick={handleSeedUsers}
            disabled={isSeeding}
            className="group inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: isSeeding 
                ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.8) 0%, rgba(75, 85, 99, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.6) 100%)',
              boxShadow: isSeeding 
                ? '0 4px 12px rgba(107, 114, 128, 0.3)'
                : '0 4px 12px rgba(34, 197, 94, 0.3)'
            }}
          >
            {isSeeding ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Seeding...
              </div>
            ) : (
              'Seed Default Users'
            )}
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="group inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(126, 34, 206, 0.6) 100%)',
              boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
            }}
          >
            {showDetails ? 'Hide' : 'Show'} Default Users
          </button>
        </div>

        {/* Status indicator */}
        {isEmpty !== null && (
          <div className={`p-3 rounded-lg border ${
            isEmpty 
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
              : 'bg-green-500/10 border-green-500/30 text-green-300'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {isEmpty ? '⚠️' : '✅'}
              </span>
              <span className="font-medium">
                {isEmpty 
                  ? 'Users collection is empty - ready for seeding'
                  : 'Users collection contains data'
                }
              </span>
            </div>
          </div>
        )}

        {/* Default users list */}
        {showDetails && (
          <div 
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}
          >
            <h4 className="text-lg font-semibold text-white mb-3">Default Users to be Created:</h4>
            <div className="space-y-2">
              {defaultUsers.map((user, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-slate-700/30"
                >
                  <div>
                    <span className="text-slate-200 font-medium">{user.email}</span>
                    {user.displayName && (
                      <span className="text-slate-400 ml-2">({user.displayName})</span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {user.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 text-sm">
              <strong>Note:</strong> Default passwords are set to simple values for development. 
              Change them in production!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSeeder;