import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface Reservation {
  id: string;
  date: string;
  slot: 'morning' | 'afternoon' | 'evening';
  creatorId: string;
  creatorName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  userName: string;
}

export const useReservationsByDate = (date: Date) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(date), 'yyyy-MM-dd');
    
    const reservationsRef = collection(db, 'reservations');
    const reservationsQuery = query(
      reservationsRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      reservationsQuery,
      (snapshot) => {
        try {
          const reservationsData: Reservation[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              date: data.date,
              slot: data.slot,
              creatorId: data.creatorId,
              creatorName: data.creatorName,
              notes: data.notes,
              createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() ?? new Date(),
              updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() ?? new Date(),
              userId: data.userId,
              userName: data.userName,
            };
          });

          setReservations(reservationsData);
          setError(null);
        } catch (err) {
          console.error('Error processing reservations:', err);
          setError('Failed to process reservations');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching reservations:', err);
        setError('Failed to load reservations');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [date]);

  return { reservations, loading, error };
};