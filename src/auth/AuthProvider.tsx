import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { autoSeedUsersIfEmpty } from '../utils/seedUsers';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<User>;
  registerWithEmailPassword: (email: string, password: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user role from Firestore
  const fetchUserRole = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role || 'user');
      } else {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', uid), {
          email: user?.email,
          role: 'user',
          createdAt: new Date(),
        });
        setUserRole('user');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user'); // Default to user role on error
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserRole(user.uid);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    // Auto-seed users if collection is empty (run once on app initialization)
    autoSeedUsersIfEmpty().catch(error => {
      console.error('Auto-seed failed:', error);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const loginWithEmailPassword = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserRole(userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Email/password login error:', error);
      throw error;
    }
  };

  const registerWithEmailPassword = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: 'user', // Default role for new users
        createdAt: new Date(),
      });
      
      setUserRole('user');
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };



  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      logout,
      loginWithEmailPassword,
      registerWithEmailPassword
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};