import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import UserSeeder from '../components/UserSeeder';
import DatabaseReset from '../components/DatabaseReset';

const DatabaseManagement: React.FC = () => {
  const { userRole } = useAuth();

  if (userRole !== 'admin') {
    return (
      <div 
        data-test="database-management-permission-error"
        className="px-4 py-3 rounded-lg mb-6 text-sm text-center" 
        style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          color: '#fca5a5' 
        }}
      >
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #1e40af 50%, #1d4ed8 75%, #2563eb 100%)',
        padding: '1rem'
      }}
    >
      <div 
        data-test="database-management-section"
        style={{
          width: '100%',
          maxWidth: '80rem',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem'
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white" data-test="database-management-title">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Database Management
            </span>
          </h2>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">System Tools</span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Database Reset Component */}
          <div data-test="database-reset-section" className="bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-xl border border-red-500/30 rounded-xl p-6">
            <DatabaseReset />
          </div>
          
          {/* User Seeder Component */}
          <div data-test="user-seeder-section" className="bg-gradient-to-r from-green-900/20 to-green-800/20 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 data-test="user-seeder-title" className="text-xl font-bold text-white">User Seeding</h3>
            </div>
            <p data-test="user-seeder-description" className="text-slate-300 text-sm mb-4">
              Populate the database with default users for testing and development purposes.
            </p>
            <UserSeeder />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagement;