import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useReservationsByDate } from '../calendar/useReservationsByDate';

const ReservationList: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { reservations, loading, error } = useReservationsByDate(selectedDate);
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(event.target.value));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Minhas Reservas</h1>
      
      <div className="mb-4">
        <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-1">
          Selecionar Data
        </label>
        <input
          id="date-picker"
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          className="p-2 border rounded"
        />
      </div>
      
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : reservations.length > 0 ? (
        <div className="space-y-4">
          {reservations.map(reservation => (
            <div 
              key={reservation.id}
              className="p-4 border rounded"
              data-testid={`reservation-${reservation.id}`}
            >
              <p className="font-medium">{format(new Date(reservation.date), 'PP')}</p>
              <p className="text-sm capitalize">{reservation.slot}</p>
              <p className="text-sm text-gray-600">{reservation.creatorName}</p>
              {reservation.notes && (
                <p className="text-sm mt-2 italic">{reservation.notes}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          Nenhuma reserva encontrada para esta data.
        </div>
      )}
  );
};

export default ReservationList;