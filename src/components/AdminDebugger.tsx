import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useAuthRole } from '../auth/useAuthRole';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const AdminDebugger: React.FC = () => {
    const { user } = useAuth();
    const { role, isAdmin } = useAuthRole();

    const makeCurrentUserAdmin = async () => {
        if (!user) {
            alert('No user logged in');
            return;
        }

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                role: 'admin'
            });
            alert('User role updated to admin. Please refresh the page.');
            window.location.reload();
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Error updating user role');
        }
    };

    if (!user) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: '#f0f0f0',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999
        }}>
            <div><strong>Debug Info:</strong></div>
            <div>Email: {user.email}</div>
            <div>Role: {role || 'loading...'}</div>
            <div>Is Admin: {isAdmin ? 'Yes' : 'No'}</div>
            {!isAdmin && (
                <button 
                    onClick={makeCurrentUserAdmin}
                    style={{
                        marginTop: '5px',
                        padding: '5px 10px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                >
                    Make Admin
                </button>
            )}
        </div>
    );
};

export default AdminDebugger;