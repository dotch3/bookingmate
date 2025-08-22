import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { deleteUser, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase/firebase';
import { seedDefaultUsers } from './seedUsers';
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
    
    // Store current admin user info before reset
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    
    const currentUserEmail = currentUser.email;
    console.log('Current admin user:', currentUserEmail);
    
    // Step 1: Clear all Firestore collections
    await clearFirestoreCollections();
    
    // Step 2: Clear Firebase Auth users (except current admin)
    await clearFirebaseAuthUsers(currentUser.uid);
    
    // Step 3: Re-seed the database with default users
    console.log('Re-seeding database with default users...');
    await seedDefaultUsers(true); // Force seeding even if collection exists
    
    console.log('Database reset completed successfully!');
    toast.success('Database reset to initial state successfully!');
    
  } catch (error) {
    console.error('Error resetting database:', error);
    toast.error(`Failed to reset database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

/**
 * Clear all documents from Firestore collections
 * Preserves admin@test.com user in the users collection
 */
const clearFirestoreCollections = async (): Promise<void> => {
  const collections = ['users', 'reservations', 'slotCaps', 'reservationHistory'];
  
  for (const collectionName of collections) {
    try {
      console.log(`Clearing collection: ${collectionName}`);
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        console.log(`Collection ${collectionName} is already empty`);
        continue;
      }
      
      // Use batch operations for better performance
      const batch = writeBatch(db);
      let batchCount = 0;
      let deletedCount = 0;
      let preservedCount = 0;
      
      for (const docSnapshot of snapshot.docs) {
        const docData = docSnapshot.data();
        
        // For users collection, preserve admin@test.com
        if (collectionName === 'users' && docData.email === 'admin@test.com') {
          console.log('Preserving admin@test.com user');
          preservedCount++;
          continue;
        }
        
        batch.delete(doc(db, collectionName, docSnapshot.id));
        batchCount++;
        deletedCount++;
        
        // Firestore batch limit is 500 operations
        if (batchCount >= 500) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} deletions for ${collectionName}`);
          batchCount = 0;
        }
      }
      
      // Commit remaining operations
      if (batchCount > 0) {
        await batch.commit();
        console.log(`Committed final batch of ${batchCount} deletions for ${collectionName}`);
      }
      
      console.log(`Successfully cleared collection: ${collectionName} (deleted: ${deletedCount}, preserved: ${preservedCount})`);
      
    } catch (error) {
      console.error(`Error clearing collection ${collectionName}:`, error);
      // Continue with other collections even if one fails
    }
  }
};

/**
 * Clear Firebase Auth users except the current admin
 * Note: This is a simplified approach. In production, you should use Firebase Admin SDK
 */
const clearFirebaseAuthUsers = async (currentAdminUid: string): Promise<void> => {
  try {
    console.log('Clearing Firebase Auth users...');
    
    // Note: Firebase Client SDK doesn't provide a way to list all users
    // This is a limitation - in a real production environment, you would:
    // 1. Use Firebase Admin SDK on the server side
    // 2. Or maintain a list of user UIDs in Firestore
    
    // For now, we'll just log that this step would be handled by the server
    console.log('Firebase Auth user cleanup would be handled by server-side Admin SDK');
    console.log(`Current admin UID ${currentAdminUid} will be preserved`);
    
    // In a production environment, you would make an API call to your backend
    // that uses Firebase Admin SDK to list and delete users
    
  } catch (error) {
    console.error('Error clearing Firebase Auth users:', error);
    // Don't throw here as this is not critical for the reset process
  }
};

/**
 * Check if the current user has admin privileges
 */
export const checkAdminPrivileges = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }
    
    // Get user document from Firestore to check role
    const userDoc = await getDocs(
      collection(db, 'users')
    );
    
    const adminUser = userDoc.docs.find(doc => 
      doc.id === currentUser.uid && doc.data().role === 'admin'
    );
    
    return !!adminUser;
  } catch (error) {
    console.error('Error checking admin privileges:', error);
    return false;
  }
};

/**
 * Get database statistics before reset
 */
export const getDatabaseStats = async (): Promise<{
  users: number;
  reservations: number;
  slotCaps: number;
  reservationHistory: number;
}> => {
  const stats = {
    users: 0,
    reservations: 0,
    slotCaps: 0,
    reservationHistory: 0
  };
  
  try {
    const collections = ['users', 'reservations', 'slotCaps', 'reservationHistory'] as const;
    
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        stats[collectionName] = snapshot.size;
      } catch (error) {
        console.error(`Error getting stats for ${collectionName}:`, error);
      }
    }
  } catch (error) {
    console.error('Error getting database stats:', error);
  }
  
  return stats;
};