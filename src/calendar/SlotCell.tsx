import React from 'react';
import type { Reservation } from './useReservationsByDate';
import type { User } from 'firebase/auth';

interface SlotCellProps {
  date: string;
  slot: string;
  reservations: Reservation[];
  user: User | null;
}

export const SlotCell: React.FC<SlotCellProps> = ({ date, slot, reservations, user }) => {
  const isFull = reservations.length >= 2;
  
  const handleReserve = () => {
    // TODO: Implement reservation creation
    console.log('Creating reservation for', date, slot, user?.uid);
  };

  return (
    <div 
      className={`p-4 border rounded ${isFull ? 'bg-gray-100' : 'bg-white'}`}
      data-testid={`slot-${date}-${slot}`}
    >
      <h3 className="font-medium capitalize">{slot}</h3>
      <div className="mt-2">
        {reservations.map((reservation: Reservation) => (
          <div key={reservation.id} className="text-sm">
            {reservation.creatorName}
          </div>
        ))}
      </div>
      <button
        onClick={handleReserve}
        disabled={isFull || !user}
        className={`mt-2 px-3 py-1 rounded text-sm ${
          isFull 
            ? 'bg-gray-300 cursor-not-allowed' 
            : !user
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
        data-testid={`reserve-${date}-${slot}`}
      >
        {isFull ? 'Full' : !user ? 'Login to Reserve' : 'Reserve'}
      </button>
    </div>
  );
};