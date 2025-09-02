import { apiClient } from '../services/apiClient';

interface SeedUser {
  email: string;
  password: string;
  role: 'admin' | 'user';
  displayName?: string;
}

// Get email domain from environment variables
const getEmailDomain = (): string => {
  return import.meta.env.VITE_EMAIL_DOMAIN || 'bookingmate.com';
};

// Default users to seed
const getDefaultUsers = (): SeedUser[] => {
  const domain = getEmailDomain();
  return [
    {
      email: `admin@${domain}`,
      password: 'admin123',
      role: 'admin',
      displayName: 'System Administrator'
    },
    {
      email: `user1@${domain}`,
      password: 'user123',
      role: 'user',
      displayName: 'John Doe'
    },
    {
      email: `user2@${domain}`,
      password: 'user123',
      role: 'user',
      displayName: 'Jane Smith'
    },
    {
      email: `manager@${domain}`,
      password: 'manager123',
      role: 'admin',
      displayName: 'Manager User'
    }
  ];
};

/**
 * Check if users collection is empty by calling the public setup status API
 */
export const isUsersCollectionEmpty = async (): Promise<boolean> => {
  try {
    // Use the public setup status endpoint that doesn't require authentication
    const response = await apiClient.get<{ isFirstTime: boolean; needsSetup: boolean }>('/api/auth/setup/status');
    const data = response.data || response as any;
    
    // If it's first time setup, users collection is empty
    return data.isFirstTime || data.needsSetup;
  } catch (error: any) {
    console.error('Error checking users collection:', error);
    // If there's an error, assume users collection is empty to allow seeding
    return true;
  }
};

/**
 * Seed all default users using the API endpoint
 */
export const seedDefaultUsers = async (force: boolean = false): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🌱 Starting user seeding process...');
    
    // Call the API seed endpoint
    const response = await apiClient.post<{
      results: any[];
      errors: any[];
      summary: { created: number; skipped: number; failed: number };
    }>('/api/users/seed', {
      users: getDefaultUsers()
    });
    
    const data = response.data || response as any;
    const { results, errors, summary } = data;
    
    console.log('Seeding results:', results);
    if (errors && errors.length > 0) {
      console.error('Seeding errors:', errors);
    }
    
    const message = `Seeding completed! ✅ ${summary.created} users created, ⏭️ ${summary.skipped} skipped, ❌ ${summary.failed} failed`;
    console.log(message);
    
    return {
      success: summary.failed === 0,
      message
    };
  } catch (error: any) {
    const errorMessage = `Error during user seeding: ${error.response?.data?.message || error.message}`;
    console.error(errorMessage);
    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * Auto-seed users on app initialization if collection is empty
 */
export const autoSeedUsersIfEmpty = async (): Promise<void> => {
  try {
    const isEmpty = await isUsersCollectionEmpty();
    if (isEmpty) {
      console.log('🌱 Users collection is empty. Auto-seeding default users...');
      await seedDefaultUsers();
    }
  } catch (error) {
    console.error('Error in auto-seed process:', error);
  }
};

/**
 * Get list of default users (for reference)
 */
export const getDefaultUsersForDisplay = (): Omit<SeedUser, 'password'>[] => {
  return getDefaultUsers().map(({ password, ...user }) => user);
};