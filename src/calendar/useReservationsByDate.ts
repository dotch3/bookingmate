import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export interface Reservation {
  id: string;
  date: string;
  slot: 'morning' | 'afternoon' | 'evening';
  creatorId: string;
  creatorName: string;
  status: 'active' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useReservationsByDate = (date: Date) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Format date to YYYY-MM-DD for Firestore query
    const formattedDate = date.toISOString().split('T')[0];
    
    const q = query(
      collection(db, 'reservations'),
      where('date', '==', formattedDate)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const reservationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Reservation[];
        
        setReservations(reservationsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [date]);

  return { reservations, loading, error };
};