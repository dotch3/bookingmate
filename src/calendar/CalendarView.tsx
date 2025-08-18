import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useReservationsByDate } from './useReservationsByDate';
import { SlotCell } from './SlotCell';
import { format } from 'date-fns';

const slots = ['morning', 'afternoon', 'evening'];

const CalendarView: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { reservations, loading, error } = useReservationsByDate(selectedDate);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(event.target.value));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Calendário de Reservas</h1>
      <input
        type="date"
        value={format(selectedDate, 'yyyy-MM-dd')}
        onChange={handleDateChange}
        className="mb-4"
      />
      
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {slots.map((slot) => (
            <SlotCell
              key={slot}
              date={format(selectedDate, 'yyyy-MM-dd')}
              slot={slot}
              reservations={reservations.filter(res => res.slot === slot)}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarView;