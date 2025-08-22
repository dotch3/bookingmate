import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase/firebase';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'react-toastify';
import UserSeeder from '../components/UserSeeder';
import DatabaseReset from '../components/DatabaseReset';

interface User {
  id: string;
  email: string;
  role: string;
  displayName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userRole } = useAuth();

  // New user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserName, setNewUserName] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Edit user state
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState('user');

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching users from database...');
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      console.log('Users snapshot size:', usersSnapshot.size);
      
      const usersList = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('User doc:', doc.id, data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date(),
        };
      }) as User[];
      
      console.log('Processed users list:', usersList);
      setUsers(usersList);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole !== 'admin') {
      setError('You do not have permission to access this page.');
      return;
    }
    
    fetchUsers();
  }, [userRole]);

  // Create a new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Store current admin user reference
      const currentAdminUser = auth.currentUser;
      
      if (!currentAdminUser) {
        throw new Error('Admin user not authenticated');
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUserEmail,
        newUserPassword
      );
      
      const newUser = userCredential.user;
      
      // Add user to Firestore with role
      await setDoc(doc(db, 'users', newUser.uid), {
        email: newUserEmail,
        role: newUserRole,
        displayName: newUserName || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Sign out the newly created user and restore admin session
      await auth.signOut();
      
      // Re-authenticate the admin user using signInWithEmailAndPassword
      // Note: In a production environment, you should use Firebase Admin SDK
      // For now, we'll show a success message and let the user handle re-authentication if needed
      
      toast.success('User created successfully!');
      
      // Reset form
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      setNewUserName('');
      setIsFormOpen(false);
      
      // Refresh user list
      fetchUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email address is already in use by another account.');
      } else {
        setError(err.message || 'Failed to create user. Please try again.');
      }
      toast.error(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Change user role
  const handleRoleChange = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId);
    const oldRole = user?.role;
    
    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      // Show success toast notification
      toast.success(`Successfully updated ${user?.email}'s role to ${newRole}`);
      
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Failed to update user role. Please try again.');
      
      // Revert the select value on error
      const selectElement = document.querySelector(`[data-test="user-role-select-${userId}"]`) as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = oldRole || 'user';
      }
    }
  };

  // Edit user
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToEdit(user);
      setEditUserEmail(user.email);
      setEditUserName(user.displayName || '');
      setEditUserRole(user.role);
      setShowEditModal(true);
    }
  };
  
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', userToEdit.id), {
        email: editUserEmail,
        displayName: editUserName || null,
        role: editUserRole,
        updatedAt: new Date(),
      }, { merge: true });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userToEdit.id 
          ? { 
              ...user, 
              email: editUserEmail, 
              displayName: editUserName || undefined,
              role: editUserRole,
              updatedAt: new Date()
            } 
          : user
      ));
      
      // Reset form and close modal
      setShowEditModal(false);
      setUserToEdit(null);
      setEditUserEmail('');
      setEditUserName('');
      setEditUserRole('user');
      
      toast.success('User updated successfully!');
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }
  };
  
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      // Show success toast notification
      toast.success(`Successfully deleted user ${userToDelete.email}`);
      
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div 
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
          <h2 className="text-3xl font-bold text-white" data-test="user-management-title">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              User Management
            </span>
          </h2>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">{users.length} users</span>
          </div>
        </div>

        {/* Database Reset Component */}
        <DatabaseReset />
        
        {/* User Seeder Component */}
        <UserSeeder />
      
      {error && (
        <div 
          className="backdrop-blur-xl bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3"
          style={{
            backdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(127, 29, 29, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem'
          }}
          data-test="error-message"
        >
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-red-200 text-sm font-medium">{error}</p>
        </div>
      )}
      
      <div className="flex justify-end mb-6">
        <button 
          className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-medium rounded-lg hover:from-green-500 hover:to-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
          onClick={() => setIsFormOpen(!isFormOpen)}
          data-test="create-user-toggle-button"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.6) 100%)',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}
        >
          {isFormOpen ? (
            <>
              <svg className="w-4 h-4 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>New User</span>
            </>
          )}
        </button>
      </div>
      
      {/* create new user */}
      {isFormOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '5rem',
            paddingBottom: '2rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            overflowY: 'auto',
            zIndex: 50
          }}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.9))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '32rem',
              width: '100%',
              margin: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white" style={{ color: 'lightgray' }} data-test="create-user-form-title">
              Create New User
            </h3>
          </div>
          
          <form onSubmit={handleCreateUser} className="space-y-6" data-test="create-user-form">
            <div className="group">
              <label className="block text-sm font-semibold text-white mb-3 flex items-center space-x-2" style={{ color: 'lightgray' }} htmlFor="email">
            
                <span>Email Address</span>
              </label>
              <input
                type="email"
                id="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
                placeholder="Enter user email"
                className="w-full px-4 py-4 bg-white-800/50 border border-slate-600/50 rounded-xl text-white placeholder-white-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 group-hover:border-slate-500/70"
                data-test="new-user-email-input"
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  backdropFilter: 'blur(8px)'
                }}
              />
            </div>
            
            <div className="group">
              <label className="block text-sm font-semibold text-white mb-3 flex items-center space-x-2" style={{ color: 'lightgray' }} htmlFor="password">
             
                <span>Password</span>
              </label>
              <input
                type="password"
                id="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-white-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 group-hover:border-slate-500/70"
                data-test="new-user-password-input"
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  backdropFilter: 'blur(8px)'
                }}
              />
            </div>
            
            <div className="group">
              <label className="block text-sm font-semibold text-white mb-3 flex items-center space-x-2" style={{ color: 'lightgray' }} htmlFor="name">
              
                <span>Display Name</span>
                <span className="text-xs text-white-400" style={{color: 'lightgray'}}>(Optional)</span>
              </label>
              <input
                type="text"
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter display name"
                className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-white-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-400/50 transition-all duration-300 group-hover:border-slate-500/70"
                data-test="new-user-name-input"
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  backdropFilter: 'blur(8px)'
                }}
              />
            </div>
            
            <div className="group">
              <label className="block text-sm font-semibold text-white mb-3 flex items-center space-x-2" style={{color: 'lightgray'}} htmlFor="role">
                <span>User Role</span>
              </label>
              <select
                id="role"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400/50 transition-all duration-300 group-hover:border-slate-500/70 appearance-none cursor-pointer"
                data-test="new-user-role-select"
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  backdropFilter: 'blur(8px)',
                  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="user" style={{ backgroundColor: '#1e293b', color: 'white' }}>👤 User</option>
                <option value="admin" style={{ backgroundColor: '#1e293b', color: 'white' }}>🛡️ Admin</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.8), rgba(55, 65, 81, 0.9))',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                data-test="create-user-submit-button"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
      
      {loading && !isFormOpen ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg text-slate-300 font-medium">Loading users...</span>
          </div>
        </div>
      ) : (
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
              padding: '1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Users Directory</h3>
              <div className="flex-1"></div>
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{users.length} total users</span>
              </div>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '100%' }} data-test="users-table">
              <thead 
                style={{
                  background: 'rgba(51, 65, 85, 0.4)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }} 
                data-test="users-table-header"
              >
                <tr>
                  <th 
                    style={{
                      padding: '1.25rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: 'rgba(203, 213, 225, 1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }} 
                    data-test="users-table-header-email"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-2 h-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <span>Email</span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '1.25rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: 'rgba(203, 213, 225, 1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }} 
                    data-test="users-table-header-name"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-2 h-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Name</span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '1.25rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: 'rgba(203, 213, 225, 1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }} 
                    data-test="users-table-header-role"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-2 h-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Role</span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '1.25rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: 'rgba(203, 213, 225, 1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }} 
                    data-test="users-table-header-created"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-2 h-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm6 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Created</span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '1.25rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: 'rgba(203, 213, 225, 1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }} 
                    data-test="users-table-header-updated"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-2 h-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Last Update</span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '1.25rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: 'rgba(203, 213, 225, 1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }} 
                    data-test="users-table-header-actions"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-2 h-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody data-test="users-table-body">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center" data-test="no-users-message">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-3 bg-gradient-to-r from-slate-600/30 to-slate-500/20 rounded-full">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-slate-300 mb-2">No users found</h3>
                        <p className="text-sm text-slate-400">Create your first user to get started</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="group transition-all duration-300" 
                    data-test={`user-row-${user.id}`}
                    style={{
                      background: index % 2 === 0 ? 'rgba(51, 65, 85, 0.1)' : 'transparent',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = index % 2 === 0 ? 'rgba(51, 65, 85, 0.1)' : 'transparent';
                    }}
                  >
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }} data-test={`user-email-${user.id}`}>
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-sm font-medium text-slate-200">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }} data-test={`user-name-${user.id}`}>
                      <div className="text-sm font-medium text-slate-200">{user.displayName || '-'}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 border border-slate-500/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200 hover:from-slate-600 hover:to-slate-500"
                        data-test={`user-role-select-${user.id}`}
                        style={{
                          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
                          border: '1px solid rgba(100, 116, 139, 0.5)',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <option value="user" style={{ backgroundColor: '#475569', color: 'white' }}>👤 User</option>
                        <option value="admin" style={{ backgroundColor: '#475569', color: 'white' }}>🛡️ Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }} data-test={`user-created-${user.id}`}>
                      <div className="text-sm text-slate-200">
                        {user.createdAt.toLocaleDateString('en-US')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {user.createdAt.toLocaleTimeString('en-US')}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }} data-test={`user-updated-${user.id}`}>
                      <div className="text-sm text-slate-200">
                        {user.updatedAt ? user.updatedAt.toLocaleDateString('en-US') : '-'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {user.updatedAt ? user.updatedAt.toLocaleTimeString('en-US') : ''}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <div className="flex items-center space-x-3">
                        <button 
                          className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
                          onClick={() => handleEditUser(user.id)}
                          data-test={`edit-user-${user.id}`}
                          style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.6) 100%)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            marginRight: '0.75rem'
                          }}
                        >
                          <svg className="w-4 h-4 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-medium rounded-lg hover:from-red-500 hover:to-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
                          onClick={() => handleDeleteUser(user.id)}
                          data-test={`delete-user-${user.id}`}
                          style={{
                            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(239, 68, 68, 0.6) 100%)',
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                          }}
                        >
                          <svg className="w-4 h-4 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '5rem',
            paddingBottom: '2rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            overflowY: 'auto',
            zIndex: 1000
          }}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1.5rem',
              padding: '2rem',
              maxWidth: '32rem',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center mb-6">
              <div 
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  marginRight: '1rem',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white" style={{color: 'lightgray'}}>Confirm Delete</h3>
            </div>
            
            <div className="mb-8">
              <p className="text-slate-300 text-base leading-relaxed" style={{color: 'lightgray'}}>
                Are you sure you want to delete user <span className="font-semibold text-white" style={{color: 'lightgray'}}>{userToDelete?.email}</span>? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.8), rgba(55, 65, 81, 0.9))',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
       {showEditModal && (
         <div 
           style={{
             position: 'fixed',
             top: '0',
             left: '0',
             right: '0',
             bottom: '0',
             backgroundColor: 'rgba(0, 0, 0, 0.75)',
             backdropFilter: 'blur(8px)',
             zIndex: '9999',
             display: 'flex',
             alignItems: 'flex-start',
             justifyContent: 'center',
             paddingTop: '5rem',
             paddingBottom: '2rem',
             paddingLeft: '1rem',
             paddingRight: '1rem',
             overflowY: 'auto'
           }}
         >
           <div 
             style={{
               background: 'rgba(30, 41, 59, 0.95)',
               backdropFilter: 'blur(20px)',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               borderRadius: '0.75rem',
               padding: '1.5rem',
               width: '100%',
               maxWidth: '28rem',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
               transform: 'translateY(0)',
               transition: 'all 0.3s ease'
             }}
           >
             <div className="flex items-center space-x-3 mb-6">
               <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                 <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                 </svg>
               </div>
               <h2 className="text-2xl font-bold text-white" style={{color: 'lightgray'}}>Edit User</h2>
             </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-6">
               <div className="group">
                 <label className="block text-sm font-semibold text-white mb-3" style={{color: 'lightgray'}}>
                   <span>Email</span>
                 </label>
                 <input
                   type="email"
                   value={editUserEmail}
                   onChange={(e) => setEditUserEmail(e.target.value)}
                   className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                   style={{
                     width: '100%',
                     padding: '1rem',
                     backgroundColor: 'rgba(30, 41, 59, 0.5)',
                     border: '1px solid rgba(71, 85, 105, 0.5)',
                     borderRadius: '0.75rem',
                     color: 'white',
                     backdropFilter: 'blur(8px)'
                   }}
                   required
                 />
               </div>
               
               <div className="group">
                 <label className="block text-sm font-semibold text-white mb-3" style={{color: 'lightgray'}}>
                   <span>Display Name</span>
                 </label>
                 <input
                   type="text"
                   value={editUserName}
                   onChange={(e) => setEditUserName(e.target.value)}
                   className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                   style={{
                     width: '100%',
                     padding: '1rem',
                     backgroundColor: 'rgba(30, 41, 59, 0.5)',
                     border: '1px solid rgba(71, 85, 105, 0.5)',
                     borderRadius: '0.75rem',
                     color: 'white',
                     backdropFilter: 'blur(8px)'
                   }}
                   placeholder="Optional"
                 />
               </div>
               
               <div className="group">
                 <label className="block text-sm font-semibold text-white mb-3" style={{color: 'lightgray'}}>
                   <span>User Role</span>
                 </label>
                 <select
                   value={editUserRole}
                   onChange={(e) => setEditUserRole(e.target.value as 'user' | 'admin')}
                   className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300"
                   style={{
                     width: '100%',
                     padding: '1rem',
                     backgroundColor: 'rgba(30, 41, 59, 0.5)',
                     border: '1px solid rgba(71, 85, 105, 0.5)',
                     borderRadius: '0.75rem',
                     color: 'white',
                     backdropFilter: 'blur(8px)'
                   }}
                 >
                   <option value="user" style={{ backgroundColor: '#1e293b', color: 'white' }}>User</option>
                   <option value="admin" style={{ backgroundColor: '#1e293b', color: 'white' }}>Admin</option>
                 </select>
               </div>
              
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setUserToEdit(null);
                    setEditUserEmail('');
                    setEditUserName('');
                    setEditUserRole('user');
                  }}
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.8), rgba(55, 65, 81, 0.9))',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminUserManagement;