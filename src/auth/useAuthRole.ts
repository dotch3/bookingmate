import { useAuth } from './AuthProvider';

export const useAuthRole = () => {
  const { userRole } = useAuth();

  return {
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user',
    role: userRole,
  };
};