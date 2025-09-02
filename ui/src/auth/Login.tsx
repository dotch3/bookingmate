import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // v6+
import { useAuth } from './AuthProvider';
import { getPasswordRequirements } from '../utils/validation';

interface LoginProps {
  onLogin?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();



  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Use AuthProvider's login method to properly manage authentication state
        await login(email, password);
        console.log('User signed in successfully');
        
        onLogin?.();
        navigate('/');
      } else {
        // For now, redirect to login since user creation should be handled by admin
        setError('User registration is handled by administrators. Please contact an admin to create your account.');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err?.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4" 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      data-test="login-page">
      <div 
          className="w-full max-w-md"
          style={{
            width: '100%',
            maxWidth: '28rem'
          }}>
        <div 
            className="backdrop-blur-xl bg-slate-800/80 border border-slate-600/30 rounded-2xl shadow-2xl p-8" 
            style={{
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '2rem'
            }}
          data-test="login-card">
          <div className="text-center mb-8" style={{ textAlign: 'center', marginBottom: '2.5rem' }} data-test="login-header">
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }} data-test="app-title">BookingMate</h2>
            <p className="text-slate-300" style={{ color: '#cbd5e1', fontSize: '1rem' }} data-test="login-description">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg mb-6 text-sm" 
                 style={{ 
                   backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                   border: '1px solid rgba(239, 68, 68, 0.3)', 
                   color: '#fca5a5',
                   marginBottom: '1.5rem',
                   borderRadius: '0.5rem',
                   padding: '0.75rem 1rem'
                 }} 
                 data-test="error-message">
              {error}
            </div>
          )}

          {/* First-time Setup Section */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start">
              <span className="text-blue-400 mr-2">ℹ️</span>
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">First-time Setup</p>
                <p>This account will have full administrative privileges and can create other users, manage reservations, and configure the system.</p>
              </div>
            </div>
          </div>

          {/* Password Requirements Section */}
          <div className="mb-6 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <p className="text-xs font-medium text-slate-300 mb-2">Password Requirements:</p>
            <ul className="text-xs text-slate-400 space-y-1">
              {getPasswordRequirements().map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-slate-500 mr-2">•</span>
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          <form className="space-y-6" onSubmit={handleEmailPasswordAuth} data-test="login-form" style={{ marginBottom: '0' }}>
            <div style={{ width: '100%', marginBottom: '1.5rem' }}>
              <label className="block text-sm font-medium text-slate-300 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.75rem' }} data-test="email-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  backgroundColor: 'rgba(51, 65, 85, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backdropFilter: 'blur(8px)'
                }}
                placeholder="Enter your email"
                data-test="email-input"
                required
              />
            </div>

            <div style={{ width: '100%', marginBottom: '2rem' }}>
              <label className="block text-sm font-medium text-slate-300 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.75rem' }} data-test="password-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  style={{
                    width: '100%',
                    padding: '1rem 3rem 1rem 1.25rem',
                    backgroundColor: 'rgba(51, 65, 85, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backdropFilter: 'blur(8px)'
                  }}
                  placeholder="Enter your password"
                  data-test="password-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform text-slate-300 hover:text-white transition-colors duration-200"
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(51, 65, 85, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    padding: '0.375rem',
                    color: '#cbd5e1',
                    fontSize: '0.875rem',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2rem',
                    height: '2rem'
                  }}
                  data-test="password-toggle"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%)',
                color: 'white',
                fontWeight: '600',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                backdropFilter: 'blur(8px)',
                opacity: loading ? 0.7 : 1
              }}
              data-test="submit-button"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
