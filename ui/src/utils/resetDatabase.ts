import { apiClient } from '../services/apiClient';
import { toast } from 'react-toastify';

/**
 * Reset the entire database to its initial state
 * This function will:
 * 1. Clear all Firestore collections (users, reservations, slotCaps, reservationHistory)
 * 2. Delete all Firebase Auth users (except the current admin)
 * 3. Re-seed the database with default users
 */
export const resetDatabaseToInitialState = async (): Promise<void> => {
  try {
    console.log('Starting database reset...');
    
    // Check if user is authenticated via API token
    const token = apiClient.getToken();
    if (!token) {
      throw new Error('No authenticated user found');
    }
    
    console.log('User is authenticated via API token');
    
    // Call the API endpoint to reset the database
    const result = await apiClient.resetDatabase();
    
    console.log('Database reset completed successfully!', result);
    toast.success('Database reset successfully! Please refresh the page to see the setup wizard.');
    
  } catch (error) {
    console.error('Error resetting database:', error);
    toast.error(`Failed to reset database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

/**
 * Check if the current user has admin privileges
 */
export const checkAdminPrivileges = async (): Promise<boolean> => {
  try {
    const token = apiClient.getToken();
    if (!token) {
      return false;
    }
    
    // Get user profile from API
    const profile = await apiClient.getProfile();
    return profile.role === 'admin' || profile.role === 'master-admin';
  } catch (error) {
    console.error('Error checking admin privileges:', error);
    return false;
  }
};

// Note: getDatabaseStats has been moved to API client to avoid Firebase permission issues
// Use apiClient.getDatabaseStats() instead