import { apiClient } from '../services/apiClient';

/**
 * Check if this is the first time the app is being set up
 * Returns true if users, reservations, and slotCaps collections are all empty
 */
export const isFirstTimeSetup = async (): Promise<boolean> => {
  try {
    const response = await apiClient.getSetupStatus();
    return response.needsSetup;
  } catch (error) {
    console.error('Error checking setup status:', error);
    throw error;
  }
};

/**
 * Check if a specific email already exists in Firebase Auth
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await apiClient.checkEmailExists(email);
    return response.exists;
  } catch (error: any) {
    console.error('Error checking email existence:', error);
    return false;
  }
};

/**
 * Create a master admin account in both Firebase Auth and Firestore
 * This should only be called during first-time setup
 */
export const createMasterAdmin = async ({
  email,
  password
}: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  message: string;
  uid?: string;
}> => {
  try {
    console.log(`Creating master admin: ${email}`);

    const response = await apiClient.createMasterAdmin({
      email,
      password
    });

    console.log('Master admin created successfully');

    return {
      success: true,
      message: 'Master admin account created successfully',
      uid: response.uid
    };
  } catch (error: any) {
    console.error('Error creating master admin:', error);
    
    let message = 'Failed to create master admin account';
    
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    return {
      success: false,
      message
    };
  }
};

/**
 * Get the current setup status
 */
export const getSetupStatus = async () => {
  try {
    const response = await apiClient.getSetupStatus();
    
    return {
      isFirstTime: response.isFirstTime,
      needsSetup: response.needsSetup
    };
  } catch (error) {
    console.error('Error getting setup status:', error);
    return {
      isFirstTime: false,
      needsSetup: false
    };
  }
};