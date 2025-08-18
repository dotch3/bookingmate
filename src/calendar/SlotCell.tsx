import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useReservations } from '../hooks/useReservations';
import './SlotCell.css';

interface SlotCellProps {
  date: string;
  slot: 'morning' | 'afternoon' | 'evening';
  reservations: any[];
  user: any;
}

export const SlotCell: React.FC<SlotCellProps> = ({ date, slot, reservations, user }) => {
  const { createReservation, deleteReservation } = useReservations();
  const [isLoading, setIsLoading] = useState(false);
  
  const slotReservations = reservations.filter(res => res.slot === slot && res.status !== 'cancelled');
  const userReservation = slotReservations.find(res => res.userId === user?.uid);
  const isOwner = !!userReservation;
  const isSlotFull = slotReservations.length >= 2;

  const handleSlotClick = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (!user?.uid) {
        toast.error('Please sign in to make a reservation');
        return;
      }

      if (userReservation) {
        await deleteReservation(userReservation.id, user.uid);
        toast.success('Reservation cancelled successfully');
      } else {
        if (isSlotFull) {
          toast.error('This slot is full (maximum 2 reservations)');
          return;
        }
        
        await createReservation({
          date,
          slot,
          userId: user.uid,
          userName: user.displayName || user.email || 'User',
          status: 'active'
        });
        toast.success('Reservation created successfully!');
      }

    } catch (err) {
      toast.error('Error creating reservation');
    } finally {
      setIsLoading(false);
    }
  };



  const getSlotLabel = () => {
    switch (slot) {
      case 'morning': return 'Morning (8AM - 12PM)';
      case 'afternoon': return 'Afternoon (1PM - 5PM)';
      case 'evening': return 'Evening (6PM - 10PM)';
      default: return slot;
    }
  };

  return (
    <div 
      className={`slot-cell ${slotReservations.length > 0 ? 'reserved' : 'available'} ${isLoading ? 'loading' : ''} ${isOwner ? 'owned' : ''} ${isSlotFull ? 'full' : ''}`}
      onClick={handleSlotClick}
      data-test={`slot-cell-${slot}`}
    >
      <h3 className="slot-title" data-test={`slot-title-${slot}`}>{getSlotLabel()}</h3>
      {slotReservations.length > 0 ? (
        <div className="reservation-info" data-test={`reservation-info-${slot}`}>
          {slotReservations.map((reservation, index) => (
            <p key={reservation.id} className="reservation-item" data-test={`reservation-item-${slot}-${index}`}>
              {index + 1}. {reservation.userName}
              {reservation.userId === user?.uid && ' (You)'}
            </p>
          ))}
          {isOwner && (
            <button className="cancel-button" data-test={`cancel-button-${slot}`}>
              Click to cancel your reservation
            </button>
          )}
          {!isOwner && !isSlotFull && (
            <p className="available-text" data-test={`available-text-${slot}`}>Click to add your reservation</p>
          )}
          {!isOwner && isSlotFull && (
            <p className="full-text" data-test={`full-text-${slot}`}>Slot is full</p>
          )}
        </div>
      ) : (
        <p className="available-text" data-test={`click-to-reserve-${slot}`}>Click to reserve</p>
      )}
    </div>
  );
};