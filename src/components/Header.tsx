import React from 'react';
import { useAuth } from '../auth/AuthContext';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="flex justify-between items-center p-4 bg-blue-600 text-white">
            <h1 className="text-xl">Reservation Calendar</h1>
            <div className="flex items-center">
                {user ? (
                    <>
                        <span className="mr-4">{user.displayName}</span>
                        <button 
                            onClick={logout} 
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            data-testid="logout-button"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <span>Not authenticated</span>
                )}
            </div>
        </header>
    );
};

export default Header;