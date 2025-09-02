import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'react-toastify';
import { apiClient } from '../services/apiClient';
import type { User as ApiUser } from '../services/apiClient';
import { validateEmail, validateDisplayName, validatePassword, sanitizeFormInput } from '../utils/validation';


interface User {
  id: string;
  email: string;
  role: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole, loading: authLoading } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMore, setHasMore] = useState(false);

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
  
  // Validation error states
  const [newUserEmailErrors, setNewUserEmailErrors] = useState<string[]>([]);
  const [newUserPasswordErrors, setNewUserPasswordErrors] = useState<string[]>([]);
  const [newUserNameErrors, setNewUserNameErrors] = useState<string[]>([]);
  const [editUserEmailErrors, setEditUserEmailErrors] = useState<string[]>([]);
  const [editUserNameErrors, setEditUserNameErrors] = useState<string[]>([]);

  // Fetch users with pagination
  const fetchUsers = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      console.log('Fetching users from API with pagination...', { page, size });
      const offset = (page - 1) * size;
      const response = await apiClient.getUsers({ limit: size, offset });
      
      // Map API users to local User interface with safe date parsing
      const usersList = response.users.map(apiUser => {
        const parseDate = (dateValue: any): Date => {
          if (!dateValue) return new Date();
          if (dateValue instanceof Date) return dateValue;
          const parsed = new Date(dateValue);
          return isNaN(parsed.getTime()) ? new Date() : parsed;
        };
        
        return {
          id: apiUser.id,
          email: apiUser.email,
          role: apiUser.role,
          displayName: apiUser.displayName,
          createdAt: parseDate(apiUser.createdAt),
          updatedAt: apiUser.updatedAt ? parseDate(apiUser.updatedAt) : parseDate(apiUser.createdAt),
        };
      }) as User[];
      
      console.log('Processed users list:', usersList);
      setUsers(usersList);
      setTotalUsers(response.total);
      setHasMore(response.hasMore);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for authentication to complete
    if (authLoading) {
      return;
    }
    
    // Check if user is authenticated and has admin role
    if (!user || userRole !== 'admin') {
      setError('You do not have permission to access this page.');
      setLoading(false);
      return;
    }
    
    fetchUsers(currentPage, pageSize);
  }, [user, userRole, authLoading, currentPage, pageSize]);

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  // Create a new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const emailValidation = validateEmail(newUserEmail);
    const passwordValidation = validatePassword(newUserPassword);
    const displayNameValidation = validateDisplayName(newUserName);
    
    // Update error states
    setNewUserEmailErrors(emailValidation.errors);
    setNewUserPasswordErrors(passwordValidation.errors);
    setNewUserNameErrors(displayNameValidation.errors);
    
    // Check if all validations passed
    if (!emailValidation.isValid || !passwordValidation.isValid || !displayNameValidation.isValid) {
      toast.error('Please fix the validation errors before submitting.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Use sanitized values
      const sanitizedEmail = emailValidation.sanitizedValue;
      const sanitizedDisplayName = displayNameValidation.sanitizedValue;
      
      // Create user through API
      const newUser = await apiClient.createUser({
        email: sanitizedEmail,
        password: newUserPassword,
        role: newUserRole,
        displayName: sanitizedDisplayName
      });
      
      toast.success(`User ${newUser.email} created successfully!`);
      
      // Reset form and clear errors
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      setNewUserName('');
      setNewUserEmailErrors([]);
      setNewUserPasswordErrors([]);
      setNewUserNameErrors([]);
      setIsFormOpen(false);
      
      // Refresh the users list to show the new user
      await fetchUsers(currentPage, pageSize);
      
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user. Please try again.');
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
      // Note: User role updates through API would be handled by backend
      // For now, show a message that this feature requires backend implementation
      toast.info('User role updates through API are not yet implemented. This would be handled by the backend.');
      
      // Revert the select value
      const selectElement = document.querySelector(`[data-test="user-role-select-${userId}"]`) as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = oldRole || 'user';
      }
      
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
    
    // Validate fields
    const emailValidation = validateEmail(editUserEmail);
    const displayNameValidation = validateDisplayName(editUserName);
    
    // Update error states
    setEditUserEmailErrors(emailValidation.errors);
    setEditUserNameErrors(displayNameValidation.errors);
    
    // Check if all validations passed
    if (!emailValidation.isValid || !displayNameValidation.isValid) {
      toast.error('Please fix the validation errors before submitting.');
      return;
    }
    
    setLoading(true);
    try {
      // Use sanitized values
      const sanitizedEmail = emailValidation.sanitizedValue;
      const sanitizedDisplayName = displayNameValidation.sanitizedValue;
      
      // Simulate user update (in a real app, this would call the API)
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userToEdit.id 
            ? { ...user, email: sanitizedEmail, displayName: sanitizedDisplayName, role: editUserRole }
            : user
        )
      );
      
      toast.success(`User ${sanitizedEmail} has been updated successfully!`);
      
      // Reset form and close modal
      setShowEditModal(false);
      setUserToEdit(null);
      setEditUserEmail('');
      setEditUserName('');
      setEditUserRole('user');
      setEditUserEmailErrors([]);
      setEditUserNameErrors([]);
      
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
      // Call the API to delete the user from database
      await apiClient.deleteUser(userToDelete.id);
      
      toast.success(`User ${userToDelete.email} has been deleted successfully!`);
      
      // Reset state
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Refresh the current page data
      await fetchUsers(currentPage, pageSize);
      
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-slate-300">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2" style={{color: 'lightgray'}} data-test="user-management-title">User Management</h1>
            <p className="text-slate-300" style={{color: 'lightgray'}}>Manage user accounts and permissions</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200" data-test="error-message">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-white" style={{color: 'lightgray'}} data-test="users-section-title">Users ({totalUsers} total)</h2>
            </div>
            
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="group flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
              data-test="toggle-create-user-form"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.6) 100%)',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              {isFormOpen ? (
                <React.Fragment>
                  <svg className="w-4 h-4 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <svg className="w-4 h-4 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>New User</span>
                </React.Fragment>
              )}
            </button>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mb-6 bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center space-x-4">
              <span className="text-slate-300" style={{color: 'lightgray'}}>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="bg-slate-700 text-white rounded px-3 py-1 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-test="page-size-select"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <span className="text-slate-300" style={{color: 'lightgray'}}>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded text-sm transition-colors"
                data-test="prev-page-btn"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                      data-test={`page-${pageNum}-btn`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || !hasMore}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded text-sm transition-colors"
                data-test="next-page-btn"
              >
                Next
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12" data-test="loading-spinner">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden" data-test="users-table">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300" style={{color: 'lightgray'}}>Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300" style={{color: 'lightgray'}}>Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300" style={{color: 'lightgray'}}>Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300" style={{color: 'lightgray'}}>Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300" style={{color: 'lightgray'}}>Last Update</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300" style={{color: 'lightgray'}}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400" style={{color: 'lightgray'}} data-test="no-users-message">
                        No users found. Create your first user to get started.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/30 transition-colors" data-test={`user-row-${user.id}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {(user.displayName || user.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white font-medium" style={{color: 'lightgray'}} data-test={`user-name-${user.id}`}>
                              {user.displayName || 'No display name'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300" style={{color: 'lightgray'}} data-test={`user-email-${user.id}`}>{user.email}</td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-slate-700 text-white rounded px-2 py-1 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-test={`user-role-select-${user.id}`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-slate-300" style={{color: 'lightgray'}} data-test={`user-created-${user.id}`}>
                          {user.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-300" style={{color: 'lightgray'}} data-test={`user-updated-${user.id}`}>
                          {user.updatedAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(user.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                              data-test={`edit-user-${user.id}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                              data-test={`delete-user-${user.id}`}
                            >
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
          )}
        </div>
      </div>

      {/* Modals positioned outside main container for proper centering */}
      {/* Create new user modal */}
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
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            overflowY: 'auto',
            zIndex: 1000
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
            <div className="flex items-center space-x-3 mb-6" data-test="create-user-modal">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white" style={{ color: 'lightgray' }} data-test="create-user-form-title">
                Create New User
              </h3>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-6" data-test="create-user-modal-form">
              <div className="group">
                <label className="block text-sm font-semibold text-white mb-3" style={{ color: 'lightgray' }} htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={newUserEmail}
                  onChange={(e) => {
                    const sanitized = sanitizeFormInput(e.target.value, 'email');
                    setNewUserEmail(sanitized);
                    // Clear errors on input change
                    if (newUserEmailErrors.length > 0) {
                      setNewUserEmailErrors([]);
                    }
                  }}
                  required
                  placeholder="Enter user email"
                  className={`w-full px-4 py-4 rounded-xl text-white transition-all duration-300 ${
                    newUserEmailErrors.length > 0 ? 'border-red-500' : ''
                  }`}
                  data-test="user-email-input"
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
                {newUserEmailErrors.length > 0 && (
                  <div className="mt-2">
                    {newUserEmailErrors.map((error, index) => (
                      <p key={index} className="text-red-400 text-sm">{error}</p>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="group">
                <label className="block text-sm font-semibold text-white mb-3" style={{ color: 'lightgray' }} htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={newUserPassword}
                  onChange={(e) => {
                    setNewUserPassword(e.target.value);
                    // Clear errors on input change
                    if (newUserPasswordErrors.length > 0) {
                      setNewUserPasswordErrors([]);
                    }
                  }}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className={`w-full px-4 py-4 rounded-xl text-white transition-all duration-300 ${
                    newUserPasswordErrors.length > 0 ? 'border-red-500' : ''
                  }`}
                  data-test="user-password-input"
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
                {newUserPasswordErrors.length > 0 && (
                  <div className="mt-2">
                    {newUserPasswordErrors.map((error, index) => (
                      <p key={index} className="text-red-400 text-sm">{error}</p>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="group">
                <label className="block text-sm font-semibold text-white mb-3" style={{ color: 'lightgray' }} htmlFor="name">
                  Display Name <span className="text-xs text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={newUserName}
                  onChange={(e) => {
                    const sanitized = sanitizeFormInput(e.target.value, 'displayName');
                    setNewUserName(sanitized);
                    // Clear errors on input change
                    if (newUserNameErrors.length > 0) {
                      setNewUserNameErrors([]);
                    }
                  }}
                  placeholder="Enter display name"
                  className={`w-full px-4 py-4 rounded-xl text-white transition-all duration-300 ${
                    newUserNameErrors.length > 0 ? 'border-red-500' : ''
                  }`}
                  data-test="user-display-name-input"
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
                {newUserNameErrors.length > 0 && (
                  <div className="mt-2">
                    {newUserNameErrors.map((error, index) => (
                      <p key={index} className="text-red-400 text-sm">{error}</p>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="group">
                <label className="block text-sm font-semibold text-white mb-3" style={{color: 'lightgray'}} htmlFor="role">
                  User Role
                </label>
                <select
                  id="role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl text-white transition-all duration-300"
                  data-test="user-role-select"
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
                  data-test="create-user-submit"
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
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            overflowY: 'auto',
            zIndex: 1000
          }}
          data-test="delete-user-modal"
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
              <h3 className="text-xl font-bold text-white" style={{color: 'lightgray'}} data-test="delete-user-modal-title">Confirm Delete</h3>
            </div>
            
            <div className="mb-8">
              <p className="text-slate-300 text-base leading-relaxed" style={{color: 'lightgray'}} data-test="delete-user-warning">
                Are you sure you want to delete user <span className="font-semibold text-white" style={{color: 'lightgray'}} data-test="delete-user-email">{userToDelete?.email}</span>? This action cannot be undone.
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
                data-test="delete-user-modal-cancel"
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
                data-test="delete-user-modal-confirm"
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
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            overflowY: 'auto'
          }}
          data-test="edit-user-modal"
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
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white" style={{color: 'lightgray'}} data-test="edit-user-modal-title">Edit User</h2>
            </div>
           
           <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-white mb-3" style={{color: 'lightgray'}}>
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={editUserEmail}
                  onChange={(e) => {
                    const sanitized = sanitizeFormInput(e.target.value, 'email');
                    setEditUserEmail(sanitized);
                    // Clear errors on input change
                    if (editUserEmailErrors.length > 0) {
                      setEditUserEmailErrors([]);
                    }
                  }}
                  className={`w-full px-4 py-4 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 ${
                    editUserEmailErrors.length > 0 ? 'border-red-500' : 'border-slate-600/50'
                  }`}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    backdropFilter: 'blur(8px)'
                  }}
                  data-test="edit-user-email-input"
                  required
                />
                {editUserEmailErrors.length > 0 && (
                  <div className="mt-2">
                    {editUserEmailErrors.map((error, index) => (
                      <p key={index} className="text-red-400 text-sm">{error}</p>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="group">
                <label className="block text-sm font-semibold text-white mb-3" style={{color: 'lightgray'}}>
                  <span>Display Name</span>
                </label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => {
                    const sanitized = sanitizeFormInput(e.target.value, 'displayName');
                    setEditUserName(sanitized);
                    // Clear errors on input change
                    if (editUserNameErrors.length > 0) {
                      setEditUserNameErrors([]);
                    }
                  }}
                  className={`w-full px-4 py-4 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 ${
                    editUserNameErrors.length > 0 ? 'border-red-500' : 'border-slate-600/50'
                  }`}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    backdropFilter: 'blur(8px)'
                  }}
                  data-test="edit-user-display-name-input"
                  placeholder="Optional"
                />
                {editUserNameErrors.length > 0 && (
                  <div className="mt-2">
                    {editUserNameErrors.map((error, index) => (
                      <p key={index} className="text-red-400 text-sm">{error}</p>
                    ))}
                  </div>
                )}
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
                  data-test="edit-user-role-select"
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
                 data-test="edit-user-modal-cancel"
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
                 data-test="update-user-submit"
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
   </React.Fragment>
  );
};

export default AdminUserManagement;