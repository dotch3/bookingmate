import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthProvider';
import { apiClient } from '../services/apiClient';
import { useReservations } from '../hooks/useReservations';
import { formatReservationDate } from '../utils/dateUtils';

interface Reservation {
  id: string;
  date: string;
  slot: 'morning' | 'afternoon' | 'evening';
  creatorId: string;
  creatorName: string;
  notes?: string;
  status?: 'active' | 'cancelled';
  createdAt: Date;
  updatedAt?: Date;
}

const ReservationList: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { deleteReservation } = useReservations();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReservations = async (date: Date) => {
    setLoading(true);
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      console.log('Debug: Fetching reservations for date:', dateString);
      console.log('Debug: Auth token:', apiClient.getToken());
      console.log('Debug: Current user:', user);
      
      // Filter reservations by logged-in user ID
      const response = await apiClient.getReservations({ 
        date: dateString, 
        userId: user?.id 
      });
      const fetchedReservations = response.reservations;
      
      // Map API reservation format to our local format
      const reservationsData: Reservation[] = fetchedReservations.map((reservation) => ({
        id: reservation.id,
        date: reservation.date,
        slot: reservation.slot as 'morning' | 'afternoon' | 'evening',
        creatorId: reservation.creatorId,
        creatorName: reservation.creatorName,
        notes: reservation.notes || '',
        status: reservation.status || 'active',
        createdAt: new Date(reservation.createdAt),
        updatedAt: reservation.updatedAt ? new Date(reservation.updatedAt) : undefined,
      }));
      
      setReservations(reservationsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    if (dateValue) {
      const newDate = new Date(dateValue + 'T00:00:00');
      if (!isNaN(newDate.getTime())) {
        setSelectedDate(newDate);
      }
    } else {
      // If date is cleared, set to current date
      setSelectedDate(new Date());
    }
  };

  useEffect(() => {
    fetchReservations(selectedDate);
  }, [selectedDate]);

  const handleDeleteReservation = async (reservationId: string) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setDeletingId(reservationId);
      await deleteReservation(reservationId, user.id);
      toast.success('Reservation cancelled successfully');
      // Refresh the reservations list after deletion
      await fetchReservations(selectedDate);
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Failed to delete reservation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #1e40af 50%, #1d4ed8 75%, #2563eb 100%)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      data-test="reservation-list-container"
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '48rem',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem'
        }}
        data-test="reservation-list-card"
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }} data-test="reservation-list-header">
          <h1 
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem'
            }}
            data-test="reservation-list-title"
          >
            My Reservations
          </h1>
          <p style={{ color: 'rgba(203, 213, 225, 1)' }} data-test="reservation-list-subtitle">Manage your reservations</p>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }} data-test="date-picker-section">
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <label 
              htmlFor="date-picker" 
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'white',
                marginBottom: '0.5rem'
              }}
              data-test="date-picker-label"
            >
              Select Date
            </label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate && !isNaN(selectedDate.getTime()) ? format(selectedDate, 'yyyy-MM-dd') : ''}
              onChange={handleDateChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              data-test="reservation-date-picker"
            />
          </div>
        </div>
        
        {error && (
          <div 
            style={{
              color: '#ef4444',
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem'
            }}
            data-test="reservation-list-error"
          >
            Error: {error}
          </div>
        )}
        
        {loading ? (
          <div 
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'white',
              fontSize: '1.1rem'
            }}
            data-test="reservation-list-loading"
          >
            Loading...
          </div>
        ) : reservations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} data-test="reservation-list-items">
            {reservations.map(reservation => (
              <div 
                key={reservation.id}
                style={{
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  backdropFilter: 'blur(10px)'
                }}
                data-testid={`reservation-${reservation.id}`}
              >
                <p style={{ fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                  {formatReservationDate(reservation.date)}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'rgba(203, 213, 225, 1)', textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                  {reservation.slot}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'rgba(203, 213, 225, 0.8)', marginBottom: '0.25rem' }}>
                  {reservation.creatorName}
                </p>
                {reservation.notes && (
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', fontStyle: 'italic', color: 'rgba(203, 213, 225, 0.9)' }}>
                    {reservation.notes}
                  </p>
                )}
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleDeleteReservation(reservation.id)}
                    disabled={deletingId === reservation.id}
                    className="cancel-button"
                    data-test={`cancel-button-${reservation.slot}`}
                    style={{
                      marginTop: '8px',
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      textDecoration: 'underline',
                      cursor: deletingId === reservation.id ? 'not-allowed' : 'pointer',
                      background: 'none',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease',
                      opacity: deletingId === reservation.id ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (deletingId !== reservation.id) {
                        e.currentTarget.style.color = '#dc2626';
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (deletingId !== reservation.id) {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {deletingId === reservation.id ? 'Deleting...' : 'Click to cancel your reservation'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'rgba(203, 213, 225, 0.8)',
              fontSize: '1.1rem'
            }}
            data-test="no-reservations-message"
          >
            No reservations found for this date.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationList;