import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { Reservation } from '../reservations/types';
import AdminUserManagement from './AdminUserManagement';
import { updateReservation, deleteReservation } from '../firebase/firebase';
import { useAuth } from '../auth/AuthProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPanel: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'reservations' | 'users'>('users');
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

    // Helper function to format Firestore Timestamp to readable date
    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        
        let date: Date;
        if (timestamp instanceof Timestamp) {
            date = timestamp.toDate();
        } else if (timestamp.seconds) {
            date = new Date(timestamp.seconds * 1000);
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            return 'Invalid Date';
        }
        
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const formatTimestampSplit = (timestamp: any) => {
        if (!timestamp) return { date: 'N/A', time: '' };
        
        let date: Date;
        if (timestamp instanceof Timestamp) {
            date = timestamp.toDate();
        } else if (timestamp.seconds) {
            date = new Date(timestamp.seconds * 1000);
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            return { date: 'Invalid Date', time: '' };
        }
        
        return {
            date: date.toLocaleDateString('en-US'),
            time: date.toLocaleTimeString('en-US')
        };
    };

    const formatReservationDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US');
        } catch {
            return dateString; // fallback to original if parsing fails
        }
    };
    const [showEditModal, setShowEditModal] = useState(false);
    const [editDate, setEditDate] = useState('');
    const [editSlot, setEditSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
    const { user, userRole } = useAuth();

    const handleEditReservation = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setEditDate(reservation.date);
        setEditSlot(reservation.slot);
        setShowEditModal(true);
    };

    const handleDeleteReservation = (reservation: Reservation) => {
        // Check if user is admin
        if (userRole !== 'admin') {
            toast.error('Only administrators can delete reservations');
            return;
        }

        setReservationToDelete(reservation);
        setShowDeleteModal(true);
    };

    const confirmDeleteReservation = async () => {
        if (!reservationToDelete) return;

        try {
            await deleteReservation({ reservationId: reservationToDelete.id });
            setReservations(prev => prev.filter(r => r.id !== reservationToDelete.id));
            toast.success('Reservation deleted successfully');
        } catch (error) {
            console.error('Error deleting reservation:', error);
            toast.error('Failed to delete reservation');
        } finally {
            setShowDeleteModal(false);
            setReservationToDelete(null);
        }
    };

    const handleUpdateReservation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReservation) return;

        // Check if user is admin
        if (userRole !== 'admin') {
            toast.error('Only administrators can edit reservations');
            return;
        }

        try {
            await updateReservation({
                reservationId: editingReservation.id,
                date: editDate,
                slot: editSlot,
                notes: editingReservation.notes || ''
            });
            
            // Update local state
            setReservations(prev => prev.map(r => 
                r.id === editingReservation.id 
                    ? { ...r, date: editDate, slot: editSlot }
                    : r
            ));
            
            toast.success('Reservation updated successfully');
            setShowEditModal(false);
            setEditingReservation(null);
        } catch (error) {
            console.error('Error updating reservation:', error);
            toast.error('Failed to update reservation');
        }
    };

    useEffect(() => {
        if (activeTab === 'reservations') {
            const fetchReservations = async () => {
                setLoading(true);
                const reservationsCollection = collection(db, 'reservations');
                const reservationsQuery = query(reservationsCollection, orderBy('date', 'asc'));
                const reservationSnapshot = await getDocs(reservationsQuery);
                const reservationList = reservationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reservation[];
                setReservations(reservationList);
                setLoading(false);
            };

            fetchReservations();
        }
    }, [activeTab]);

    const renderTabContent = () => {
        if (activeTab === 'users') {
            return <AdminUserManagement />;
        }

        if (loading) {
            return <div className="loading">Loading reservations...</div>;
        }

        return (
            <div className="space-y-6">
                <div 
                    style={{
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
                    {/* Header Section */}
                    <div 
                        style={{
                            background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
                            padding: '1.5rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.75rem 0.75rem 0 0',
                            marginBottom: '0'
                        }}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm6 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">Reservations Directory</h3>
                            <div className="flex-1"></div>
                            <div className="flex items-center space-x-2 text-sm text-slate-300">
                                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>{reservations.length} total reservations</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '100%', background: 'linear-gradient(135deg, rgb(30, 58, 138) 0%, rgb(55, 48, 163) 25%, rgb(30, 64, 175) 50%, rgb(29, 78, 216) 75%, rgb(37, 99, 235) 100%)' }} data-test="reservations-table">
                            <thead 
                                style={{
                                    background: 'rgba(51, 65, 85, 0.4)',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                }} 
                                data-test="reservations-table-header"
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
                                        data-test="reservations-table-header-date"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm6 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>Reservation Date</span>
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
                                        data-test="reservations-table-header-slot"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Slot</span>
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
                                        data-test="reservations-table-header-creator"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Creator</span>
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
                                        data-test="reservations-table-header-created"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        data-test="reservations-table-header-updated"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        data-test="reservations-table-header-actions"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>Actions</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody data-test="reservations-table-body">
                                {reservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="p-3 bg-slate-700/50 rounded-full">
                                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <p style={{ color: 'rgba(148, 163, 184, 1)', fontSize: '1rem', fontWeight: '500' }}>No reservations found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    reservations.map((reservation, index) => (
                                        <tr 
                                            key={reservation.id} 
                                            className="group transition-all duration-300" 
                                            data-test={`reservation-row-${reservation.id}`}
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
                                            <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }} data-test={`reservation-date-${reservation.id}`}>
                                                <div className="flex items-center space-x-3">
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-200">{formatReservationDate(reservation.date)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td 
                                                style={{
                                                    padding: '1.25rem 1.5rem',
                                                    whiteSpace: 'nowrap',
                                                    fontSize: '0.875rem'
                                                }}
                                                data-test={`reservation-slot-${reservation.id}`}
                                            >
                                                <span 
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '0.375rem 0.75rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        background: reservation.slot === 'morning' ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.8) 0%, rgba(217, 119, 6, 0.6) 100%)' :
                                                                   reservation.slot === 'afternoon' ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.8) 0%, rgba(234, 88, 12, 0.6) 100%)' :
                                                                   'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(126, 34, 206, 0.6) 100%)',
                                                        color: 'white',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                                    }}
                                                >
                                                    {reservation.slot.charAt(0).toUpperCase() + reservation.slot.slice(1)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }} data-test={`reservation-creator-${reservation.id}`}>
                                                <div className="text-sm font-medium text-slate-200">{reservation.creatorName}</div>
                                            </td>

                                            <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }} data-test={`reservation-created-${reservation.id}`}>
                                                <div className="text-sm text-slate-300">
                                                    <div>{formatTimestampSplit(reservation.createdAt).date}</div>
                                                    <div>{formatTimestampSplit(reservation.createdAt).time}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }} data-test={`reservation-updated-${reservation.id}`}>
                                                <div className="text-sm text-slate-300">
                                                    <div>{formatTimestampSplit(reservation.updatedAt).date}</div>
                                                    <div>{formatTimestampSplit(reservation.updatedAt).time}</div>
                                                </div>
                                            </td>
                                            <td 
                                                style={{
                                                    padding: '1.25rem 1.5rem',
                                                    whiteSpace: 'nowrap',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
                                                        onClick={() => handleEditReservation(reservation)}
                                                        data-test={`edit-reservation-${reservation.id}`}
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
                                                        onClick={() => handleDeleteReservation(reservation)}
                                                        data-test={`delete-reservation-${reservation.id}`}
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
                
                {/* Edit Modal */}
                {showEditModal && editingReservation && (
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
                        data-test="edit-reservation-modal"
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
                                <h2 className="text-2xl font-bold text-white" data-test="edit-modal-title" style={{color: 'lightgray'}}>Edit Reservation</h2>
             </div>
            
            <form onSubmit={handleUpdateReservation} className="space-y-6">
               <div className="group">
                 <label className="block text-sm font-semibold text-white mb-3" style={{color: 'lightgray'}}>
                   <span>Reservation Date</span>
                 </label>
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                                        required
                                        data-test="edit-date-input"
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
                 <label className="block text-sm font-semibold text-white mb-3" style={{color: 'lightgray'}}>
                   <span>Time Slot</span>
                 </label>
                                    <select
                                        value={editSlot}
                                        onChange={(e) => setEditSlot(e.target.value as 'morning' | 'afternoon' | 'evening')}
                                        className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300"
                                        required
                                        data-test="edit-slot-select"
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
                                        <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                                        <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
                                        <option value="evening">Evening (6:00 PM - 9:00 PM)</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-4 pt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowEditModal(false)}
                                        className="px-6 py-3 text-sm font-medium text-slate-300 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-600/60 hover:text-white transition-all duration-300"
                                        data-test="edit-modal-cancel"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: 'rgba(51, 65, 85, 0.5)',
                                            border: '1px solid rgba(71, 85, 105, 0.5)',
                                            borderRadius: '0.75rem',
                                            color: 'rgba(203, 213, 225, 1)',
                                            backdropFilter: 'blur(8px)'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-blue-500/50 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                        data-test="edit-modal-save"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)',
                                            border: '1px solid rgba(59, 130, 246, 0.5)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            backdropFilter: 'blur(8px)'
                                        }}
                                    >
                                        Update Reservation
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                {/* Delete Reservation Modal */}
                {showDeleteModal && reservationToDelete && (
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white" style={{color: 'lightgray'}}>Delete Reservation</h3>
                            </div>
                            
                            <div className="mb-8">
                                <p className="text-slate-300 text-base leading-relaxed" style={{color: 'lightgray'}}>
                     Are you sure you want to delete the reservation for <span className="font-medium text-white" style={{color: 'lightgray'}}>Date:</span> <span className="font-semibold text-white" style={{color: 'lightgray'}}>{reservationToDelete.date}</span> ({reservationToDelete.slot})? This action cannot be undone.
                 </p>
                                <div className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
                                    <div className="text-sm text-slate-400">
                                        <div style={{color: 'lightgray'}}><span className="font-medium text-white">Date:</span> {reservationToDelete.date}</div>
                                        <div style={{color: 'lightgray'}}><span className="font-medium text-white">Time Slot:</span> {reservationToDelete.slot.charAt(0).toUpperCase() + reservationToDelete.slot.slice(1)}</div>
                                        <div style={{color: 'lightgray'}}><span className="font-medium text-white">User:</span> {reservationToDelete.creatorName}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setReservationToDelete(null);
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
                                    onClick={confirmDeleteReservation}
                                    className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                                    style={{
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(8px)'
                                    }}
                                >
                                    Delete Reservation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </div>
        );
    };

    return (
        <div 
            className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6"
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
                padding: '2rem 1rem'
            }}
        >
            <div className="max-w-6xl mx-auto">
                <div 
                    className="backdrop-blur-xl bg-slate-800/80 border border-slate-600/30 rounded-2xl shadow-2xl p-8 mb-6"
                    style={{
                        backdropFilter: 'blur(16px)',
                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        borderRadius: '1rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                        padding: '2rem',
                        marginBottom: '1.5rem'
                    }}
                >
                    <h1 className="text-4xl font-bold mb-6 text-center" data-test="admin-panel-title" style={{
                        color: 'white',
                        textShadow: '0 0 20px rgba(96, 165, 250, 0.5), 0 0 40px rgba(167, 139, 250, 0.3)'
                    }}>
                        Admin Panel
                    </h1>
                    <div className="flex justify-center space-x-4 mb-6">
                        <button 
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                background: activeTab === 'users' 
                                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%)'
                                    : 'linear-gradient(135deg, rgba(71, 85, 105, 0.6) 0%, rgba(51, 65, 85, 0.5) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: activeTab === 'users' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}
                            onClick={() => setActiveTab('users')}
                            data-test="user-management-tab"
                            onMouseEnter={(e) => {
                                if (activeTab !== 'users') {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(71, 85, 105, 0.8) 0%, rgba(51, 65, 85, 0.7) 100%)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== 'users') {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(71, 85, 105, 0.6) 0%, rgba(51, 65, 85, 0.5) 100%)';
                                }
                            }}
                        >
                            User Management
                        </button>
                        <button 
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                background: activeTab === 'reservations' 
                                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%)'
                                    : 'linear-gradient(135deg, rgba(71, 85, 105, 0.6) 0%, rgba(51, 65, 85, 0.5) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: activeTab === 'reservations' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}
                            onClick={() => setActiveTab('reservations')}
                            data-test="reservations-tab"
                            onMouseEnter={(e) => {
                                if (activeTab !== 'reservations') {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(71, 85, 105, 0.8) 0%, rgba(51, 65, 85, 0.7) 100%)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== 'reservations') {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(71, 85, 105, 0.6) 0%, rgba(51, 65, 85, 0.5) 100%)';
                                }
                            }}
                        >
                            Reservations
                        </button>
                    </div>
                </div>
                
                <div 
                    className="backdrop-blur-xl bg-slate-800/80 border border-slate-600/30 rounded-2xl shadow-2xl p-8"
                    style={{
                        backdropFilter: 'blur(16px)',
                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        borderRadius: '1rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                        padding: '2rem'
                    }}
                >
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;