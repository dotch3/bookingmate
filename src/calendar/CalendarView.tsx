import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useReservationsByDate } from './useReservationsByDate';
import { SlotCell } from './SlotCell';
import { format } from 'date-fns';
import MonthlyCalendarView from './MonthlyCalendarView';
import './CalendarView.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const slots: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening'];

const CalendarView: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { reservations, loading, error } = useReservationsByDate(selectedDate);
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(event.target.value));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  const handleBackToMonth = () => {
    setViewMode('month');
  };

  // Transform reservations to the format expected by MonthlyCalendarView
  const formattedReservations = reservations.map(res => {
    // Ensure proper date conversion - res.date is already a string in 'yyyy-MM-dd' format
    let dateObj: Date;
    if (typeof res.date === 'string') {
      // Parse the date string in local timezone to avoid offset issues
      const [year, month, day] = res.date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      dateObj = new Date(res.date);
    }
    
    return {
      id: res.id,
      date: dateObj,
      slot: res.slot,
      userName: res.userName || res.creatorName || 'Unknown',
      userId: res.userId || res.creatorId,
      status: res.status || 'active' // Default to 'active' if status is undefined
    };
  });

  return (
    <div className="calendar-view-wrapper">
      <div className="calendar-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" data-test="calendar-title">Booking Calendar</h1>
        <p className="text-gray-600" data-test="calendar-subtitle">Select a date to view and manage your reservations</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-test="calendar-error">
          Error: {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-8" data-test="calendar-loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {viewMode === 'month' ? (
            <MonthlyCalendarView 
              reservations={formattedReservations} 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              data-test="monthly-calendar-view"
            />
          ) : (
            <div className="day-view" data-test="day-view">
              <div className="date-header" data-test="date-header">
                <button 
                  onClick={handleBackToMonth}
                  className="back-button"
                  data-test="back-to-month-button"
                >
                  ← Back to Monthly View
                </button>
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={handleDateChange}
                  className="date-picker"
                  data-test="date-picker"
                />
              </div>
              <div className="slot-grid" data-test="slot-grid">
                {slots.map((slot) => (
                  <SlotCell
                    key={slot}
                    date={format(selectedDate, 'yyyy-MM-dd')}
                    slot={slot}
                    reservations={reservations.filter(res => 
                      res.slot === slot && res.date === format(selectedDate, 'yyyy-MM-dd')
                    )}
                    user={user}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default CalendarView;