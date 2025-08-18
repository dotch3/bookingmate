import { FirebaseError } from 'firebase/app';
import { collection, getDocs, DocumentData, Query, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Checks if the Firestore connection is working
 * @returns Promise that resolves to true if connection is working, false otherwise
 */
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    // Try to fetch a small amount of data to test connection
    const snapshot = await getDocs(collection(db, 'reservations'));
    return true;
  } catch (error) {
    console.error('Firestore connection check failed:', error);
    return false;
  }
};

/**
 * Handles common Firebase errors and returns user-friendly messages
 * @param error The Firebase error
 * @returns A user-friendly error message
 */
export const getFirebaseErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return 'You don\'t have permission to access this data.';
      case 'unavailable':
        return 'The service is currently unavailable. Please try again later.';
      case 'unauthenticated':
        return 'Please sign in to continue.';
      case 'not-found':
        return 'The requested resource was not found.';
      case 'cancelled':
        return 'Operation cancelled.';
      case 'data-loss':
        return 'Data loss occurred. Please try again.';
      case 'resource-exhausted':
        return 'Too many requests. Please try again later.';
      case 'failed-precondition':
        return 'Operation cannot be executed in the current system state.';
      default:
        return `Error: ${error.message}`;
    }
  }
  
  // Network error handling
  if (error instanceof Error) {
    if (error.message.includes('network')) {
      return 'Network error. Please check your internet connection.';
    }
    return error.message;
  }
  
  return 'An unknown error occurred.';
};

/**
 * Creates a Firestore listener with automatic retry logic
 * @param query The Firestore query
 * @param onNext Callback for successful data retrieval
 * @param onError Callback for errors
 * @param maxRetries Maximum number of retry attempts
 * @param retryDelay Delay between retries in milliseconds
 * @returns Unsubscribe function
 */
export const createFirestoreListener = <T extends DocumentData>(
  query: Query<DocumentData>,
  onNext: (data: T[]) => void,
  onError: (error: Error, isRetrying: boolean) => void,
  maxRetries = 3,
  retryDelay = 2000
): (() => void) => {
  let unsubscribe: () => void;
  let retryCount = 0;
  let retryTimeout: NodeJS.Timeout | null = null;
  
  const setupListener = () => {
    try {
      unsubscribe = onSnapshot(
        query,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown)) as T[];
          onNext(data);
          retryCount = 0; // Reset retry count on success
        },
        async (error) => {
          console.error('Firestore listener error:', error);
          
          if (retryCount < maxRetries) {
            retryCount++;
            onError(error, true); // Indicate we're retrying
            
            // Clear any existing retry timeout
            if (retryTimeout) clearTimeout(retryTimeout);
            
            // Wait before retrying
            retryTimeout = setTimeout(() => {
              // Unsubscribe from the current listener
              if (unsubscribe) unsubscribe();
              setupListener();
            }, retryDelay);
          } else {
            onError(error, false); // Indicate we're not retrying anymore
          }
        }
      );
    } catch (setupError) {
      console.error('Error setting up Firestore listener:', setupError);
      onError(setupError instanceof Error ? setupError : new Error('Unknown error'), false);
    }
  };
  
  setupListener();
  
  return () => {
    if (retryTimeout) clearTimeout(retryTimeout);
    if (unsubscribe) unsubscribe();
  };
};