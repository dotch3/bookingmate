import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';

interface SeedUser {
  email: string;
  password: string;
  role: 'admin' | 'user';
  displayName?: string;
}

// Default users to seed
const defaultUsers: SeedUser[] = [
  {
    email: 'admin@bookingmate.com',
    password: 'admin123',
    role: 'admin',
    displayName: 'System Administrator'
  },
  {
    email: 'user1@bookingmate.com',
    password: 'user123',
    role: 'user',
    displayName: 'John Doe'
  },
  {
    email: 'user2@bookingmate.com',
    password: 'user123',
    role: 'user',
    displayName: 'Jane Smith'
  },
  {
    email: 'manager@bookingmate.com',
    password: 'manager123',
    role: 'admin',
    displayName: 'Manager User'
  }
];

/**
 * Check if users collection is empty
 */
export const isUsersCollectionEmpty = async (): Promise<boolean> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.empty;
  } catch (error) {
    console.error('Error checking users collection:', error);
    return false;
  }
};

/**
 * Check if a user already exists in Firestore
 */
const userExistsInFirestore = async (uid: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

/**
 * Create a single user in Firebase Auth and Firestore
 */
const createSeedUser = async (userData: SeedUser, currentAdminUser?: any): Promise<boolean> => {
  try {
    console.log(`Creating user: ${userData.email}`);
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    const newUser = userCredential.user;
    
    // Check if user already exists in Firestore
    const exists = await userExistsInFirestore(newUser.uid);
    if (exists) {
      console.log(`User ${userData.email} already exists in Firestore`);
      return true;
    }
    
    // Add user to Firestore
    await setDoc(doc(db, 'users', newUser.uid), {
      email: userData.email,
      role: userData.role,
      displayName: userData.displayName || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`✅ Successfully created user: ${userData.email} with role: ${userData.role}`);
    
    // Sign out the newly created user
    await auth.signOut();
    
    // Re-authenticate the admin user if provided
    if (currentAdminUser) {
      await signInWithEmailAndPassword(auth, currentAdminUser.email, currentAdminUser.password);
    }
    
    return true;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`User ${userData.email} already exists in Firebase Auth`);
      return true;
    }
    console.error(`❌ Error creating user ${userData.email}:`, error);
    return false;
  }
};

/**
 * Seed all default users
 */
export const seedDefaultUsers = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🌱 Starting user seeding process...');
    
    // Check if users already exist
    const isEmpty = await isUsersCollectionEmpty();
    if (!isEmpty) {
      console.log('Users collection is not empty. Skipping seed.');
      return {
        success: true,
        message: 'Users collection already contains data. Seeding skipped.'
      };
    }
    
    const currentUser = auth.currentUser;
    let currentAdminUser = null;
    
    // If there's a current user, store their credentials for re-authentication
    if (currentUser) {
      currentAdminUser = {
        email: currentUser.email,
        password: 'temp' // We'll need to handle this differently in production
      };
    }
    
    let successCount = 0;
    let failureCount = 0;
    
    // Create each user
    for (const userData of defaultUsers) {
      const success = await createSeedUser(userData, currentAdminUser);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // Small delay between user creations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const message = `Seeding completed! ✅ ${successCount} users created, ❌ ${failureCount} failed`;
    console.log(message);
    
    return {
      success: failureCount === 0,
      message
    };
  } catch (error) {
    const errorMessage = `Error during user seeding: ${error}`;
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
export const getDefaultUsers = (): Omit<SeedUser, 'password'>[] => {
  return defaultUsers.map(({ password, ...user }) => user);
};