import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // v6+
import { auth, db } from '../firebase/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface LoginProps {
  onLogin?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function ensureUserDoc(uid: string, data: Partial<{ email: string | null; displayName: string | null }>) {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    const base = {
      role: 'user' as const,
      isActive: true,
      updatedAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      await setDoc(ref, { uid, ...data, ...base, createdAt: serverTimestamp() }, { merge: true });
    } else {
      await setDoc(ref, { ...data, ...base }, { merge: true });
    }
  }

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cred = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      await ensureUserDoc(cred.user.uid, {
        email: cred.user.email,
        displayName: cred.user.displayName ?? null,
      });

      onLogin?.();
      navigate('/');
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
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                placeholder="Enter your password"
                data-test="password-input"
                required
              />
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
