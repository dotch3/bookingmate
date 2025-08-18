import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { createReservation, updateReservation } from '../firebase/firebase';
import { Reservation } from './types';

interface ReservationDialogProps {
  reservation?: Reservation;
  onClose: () => void;
}

const ReservationDialog: React.FC<ReservationDialogProps> = ({ reservation, onClose }) => {
  const { user } = useAuth();
  const [date, setDate] = useState(reservation?.date || '');
  const [slot, setSlot] = useState(reservation?.slot || 'morning');
  const [notes, setNotes] = useState(reservation?.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reservation) {
      await updateReservation({ reservationId: reservation.id, date, slot, notes });
    } else {
      await createReservation({ date, slot, notes });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-bold">{reservation ? 'Edit Reservation' : 'Create Reservation'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Slot</label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              required
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 bg-gray-300 p-2 rounded">Cancel</button>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">{reservation ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationDialog;