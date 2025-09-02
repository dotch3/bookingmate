import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useAuthRole } from '../auth/useAuthRole';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const { isAdmin, role } = useAuthRole();
    const location = useLocation();
    


    // Don't show header on login page
    if (location.pathname === '/login') {
        return null;
    }

    return (
        <header className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white shadow-xl border-b border-slate-600" data-test="header">
            <div className="flex items-center space-x-8" data-test="header-left">
                <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" className="flex-shrink-0">
                        <defs>
                            <linearGradient id="headerBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor:'#3b82f6',stopOpacity:1}} />
                                <stop offset="100%" style={{stopColor:'#1e40af',stopOpacity:1}} />
                            </linearGradient>
                        </defs>
                        <circle cx="16" cy="16" r="15" fill="url(#headerBgGradient)" stroke="#1e40af" strokeWidth="1"/>
                        <rect x="7" y="9" width="18" height="14" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="0.5"/>
                        <rect x="7" y="9" width="18" height="4" rx="2" fill="#f3f4f6"/>
                        <rect x="10" y="6" width="1.5" height="6" rx="0.75" fill="#6b7280"/>
                        <rect x="20.5" y="6" width="1.5" height="6" rx="0.75" fill="#6b7280"/>
                        <circle cx="10" cy="16" r="1" fill="#3b82f6"/>
                        <circle cx="13" cy="16" r="1" fill="#e5e7eb"/>
                        <circle cx="16" cy="16" r="1" fill="#e5e7eb"/>
                        <circle cx="19" cy="16" r="1" fill="#e5e7eb"/>
                        <circle cx="22" cy="16" r="1" fill="#e5e7eb"/>
                        <circle cx="10" cy="19" r="1" fill="#e5e7eb"/>
                        <circle cx="13" cy="19" r="1" fill="#10b981"/>
                        <circle cx="16" cy="19" r="1" fill="#e5e7eb"/>
                        <circle cx="19" cy="19" r="1" fill="#e5e7eb"/>
                        <circle cx="22" cy="19" r="1" fill="#ef4444"/>
                    </svg>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" data-test="app-logo">
                        BookingMate
                    </h1>
                </div>
                {user && (
                    <nav className="flex space-x-1" data-test="main-navigation">
                        <Link 
                            to="/" 
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                location.pathname === '/' 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                                    : 'hover:bg-slate-600 hover:text-blue-300'
                            }`}
                            data-test="calendar-nav-link"
                        >
                            Calendar
                        </Link>
                        <Link 
                            to="/reservations" 
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                location.pathname === '/reservations' 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                                    : 'hover:bg-slate-600 hover:text-blue-300'
                            }`}
                            data-test="reservations-nav-link"
                        >
                            My Reservations
                        </Link>
                        {isAdmin && (
                            <Link 
                                to="/admin" 
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    location.pathname === '/admin' 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                                        : 'hover:bg-slate-600 hover:text-blue-300'
                                }`}
                                data-test="admin-nav-link"
                            >
                                Admin Panel
                            </Link>
                        )}
                    </nav>
                )}
            </div>
            <div className="flex items-center space-x-3" data-test="header-right">
                {user ? (
                    <>
                        <div className="text-right" data-test="user-info">
                            <div className="font-semibold text-white text-sm" data-test="user-display-name">
                                {user.displayName || 'John Doe'}
                            </div>
                            <div className="text-xs text-slate-300" data-test="user-email">{user.email}</div>
                        </div>

                        <button 
                            onClick={logout} 
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 rounded text-sm transition-all duration-200"
                            data-test="logout-button"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link 
                        to="/login"
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-all duration-200"
                        data-test="login-link"
                    >
                        Login
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;