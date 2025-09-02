import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { apiClient } from '../services/apiClient';

export interface Reservation {
  id: string;
  date: string;
  slot: 'morning' | 'afternoon' | 'evening';
  creatorId: string;
  creatorName: string;
  notes?: string;
  status?: 'active' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  userName: string;
}

export const useReservationsByDate = (date: Date) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(date), 'yyyy-MM-dd');
      
      // Fetch all reservations and filter by date range on client side
      // Note: API could be enhanced to support date range filtering
      const response = await apiClient.getReservations();
      const allReservations = response.reservations;
      
      const filteredReservations = allReservations.filter(reservation => 
        reservation.date >= startDate && reservation.date <= endDate
      );

      // Map API reservation format to our local format
      const reservationsData: Reservation[] = filteredReservations.map((reservation) => ({
        id: reservation.id,
        date: reservation.date,
        slot: reservation.slot as 'morning' | 'afternoon' | 'evening',
        creatorId: reservation.creatorId, // API uses creatorId
        creatorName: reservation.creatorName, // API uses creatorName
        notes: reservation.notes || '',
        status: reservation.status || 'active', // Default to 'active' if not provided
        createdAt: new Date(reservation.createdAt),
        updatedAt: reservation.updatedAt ? new Date(reservation.updatedAt) : new Date(reservation.createdAt),
        userId: reservation.creatorId, // Map creatorId to userId for compatibility
        userName: reservation.creatorName, // Map creatorName to userName for compatibility
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

  useEffect(() => {
    fetchReservations();
    
    // Set up polling for real-time-like updates
    const interval = setInterval(fetchReservations, 120000); // Poll every 2 minutes
    
    return () => clearInterval(interval);
  }, [date]);

  return { reservations, loading, error, refreshReservations: fetchReservations };
};