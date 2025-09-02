import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is authenticated and fetch profile
  const checkAuthStatus = async () => {
    const token = apiClient.getToken();
    if (token) {
      try {
        const profile = await apiClient.getProfile();
        setUser(profile);
        setUserRole(profile.role);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Token might be expired, clear it
        apiClient.clearToken();
        setUser(null);
        setUserRole(null);
      }
    } else {
      setUser(null);
      setUserRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
     try {
       const response = await apiClient.login({ email, password });
       // After successful login, fetch the complete user profile
       const profile = await apiClient.getProfile();
       setUser(profile);
       setUserRole(profile.role);
     } catch (error) {
       console.error('Login error:', error);
       throw error;
     }
   };

  const logout = async () => {
    try {
      apiClient.clearToken();
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    // Registration should be handled by admin through API
    throw new Error('User registration is handled by administrators. Please contact an admin to create your account.');
  };



  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      login,
      logout,
      register
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