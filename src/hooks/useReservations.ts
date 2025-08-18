import { addDoc, collection, deleteDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface CreateReservationData {
  date: string;
  slot: 'morning' | 'afternoon' | 'evening';
  userId: string;
  userName: string;
}

export const useReservations = () => {
  const createReservation = async (data: CreateReservationData) => {
    try {
      // Validação dos dados
      if (!data.date || !data.slot || !data.userId) {
        throw new Error('Invalid data for reservation creation');
      }

      const reservationsRef = collection(db, 'reservations');
      
      // Formatação correta dos dados
      const newReservation = {
        date: data.date,
        slot: data.slot,
        userId: data.userId,
        userName: data.userName || 'User',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        // Campos adicionais necessários
        creatorId: data.userId,
        creatorName: data.userName || 'User',
        notes: ''
      };
      
      // Verifica se já existe reserva para este horário
      const docRef = await addDoc(reservationsRef, newReservation);
      console.log('Reservation created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw new Error('Unable to create reservation. Please try again.');
    }
  };

  const deleteReservation = async (reservationId: string, userId: string) => {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const reservationRef = doc(db, 'reservations', reservationId);
      const reservationDoc = await getDoc(reservationRef);

      if (!reservationDoc.exists()) {
        throw new Error('Reservation not found');
      }

      const reservationData = reservationDoc.data();
      
      if (userId !== reservationData.userId && 
          userId !== reservationData.creatorId) {
        throw new Error('You do not have permission to delete this reservation');
      }

      await deleteDoc(reservationRef);
      return true;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  };

  return { createReservation, deleteReservation };
};