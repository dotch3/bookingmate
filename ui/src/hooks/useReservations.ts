import { apiClient } from '../services/apiClient';

interface CreateReservationData {
  date: string;
  slot: string;
  userId: string;
  userName: string;
}

export const useReservations = () => {
  const createReservation = async (data: CreateReservationData) => {
    try {
      // Validate data
      if (!data.date || !data.slot || !data.userId) {
        throw new Error('Invalid data for reservation creation');
      }

      // Use API to create reservation
      const reservation = await apiClient.createReservation({
        date: data.date,
        slot: data.slot,
        notes: '' // Default empty notes
      });
      
      console.log('Reservation created successfully:', reservation.id);
      return reservation.id;
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

      // Use API to delete reservation
      // The API will handle permission checks on the server side
      await apiClient.deleteReservation(reservationId);
      return true;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  };

  return { createReservation, deleteReservation };
};