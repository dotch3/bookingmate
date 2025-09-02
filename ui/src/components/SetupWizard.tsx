import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMasterAdmin, checkEmailExists } from '../utils/setupWizard';
import { validatePassword, getPasswordRequirements } from '../utils/validation';
import { toast } from 'react-toastify';

interface SetupWizardProps {
  onSetupComplete: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onSetupComplete }) => {
  const navigate = useNavigate();
  const defaultDomain = import.meta.env.VITE_EMAIL_DOMAIN || 'bookingmate.com';
  const [email, setEmail] = useState(`masteradmin@${defaultDomain}`);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      toast.error('All fields are required');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]); // Show first error
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        toast.error('This email is already in use. Please choose a different email.');
        setIsCreating(false);
        return;
      }

      // Create master admin account
      const result = await createMasterAdmin({ email, password });
      
      if (result.success) {
        toast.success(result.message);
        setStep(2); // Move to success step
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('An unexpected error occurred during setup');
    } finally {
      setIsCreating(false);
    }
  };

  const handleContinueToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to BookingMate
          </h1>
          <p className="text-slate-300">
            Let's set up your master admin account
          </p>
        </div>

        {/* Setup Card */}
        <div 
          className="backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          {step === 1 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Create Master Admin Account
                </h2>
                <p className="text-slate-300 text-sm">
                  This will be the primary administrator account for your BookingMate system.
                </p>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="mt-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
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
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    placeholder={`masteradmin@${defaultDomain}`}
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    This will be your master admin username
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                      placeholder="Enter a secure password"
                      required
                      minLength={8}
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

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                      placeholder="Confirm your password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      data-test="confirm-password-toggle"
                    >
                      {showConfirmPassword ? (
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
                  disabled={isCreating}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Admin Account...
                    </div>
                  ) : (
                    'Create Master Admin Account'
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start">
                  <span className="text-blue-400 mr-2">ℹ️</span>
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">First-time Setup</p>
                    <p>This account will have full administrative privileges and can create other users, manage reservations, and configure the system.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <span className="text-2xl">✅</span>
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-2">
                Setup Complete!
              </h2>
              
              <p className="text-slate-300 mb-6">
                Your master admin account has been created successfully. You can now log in and start using BookingMate.
              </p>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <p className="text-green-300 text-sm">
                  <strong>Login Credentials:</strong><br/>
                  Email: {email}<br/>
                  Password: [Your chosen password]
                </p>
              </div>

              <button
                onClick={handleContinueToLogin}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue to Login
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            BookingMate - Shared Calendar Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;