import React, { useState, useEffect } from 'react';
import { 
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuthRole } from '../auth/useAuthRole';
import { useAuth } from '../auth/AuthProvider';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import './MonthlyCalendarView.css';

interface Reservation {
  id: string;
  date: Date;
  slot: 'morning' | 'afternoon' | 'evening';
  userName: string;
  status?: 'active' | 'cancelled';
}

interface MonthlyCalendarViewProps {
  reservations: Reservation[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  reservations,
  onDateSelect,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({ visible: false, x: 0, y: 0, content: '' });
  const { isAdmin } = useAuthRole();
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Group reservations by date (only count active reservations)
  const reservationsByDate = reservations.reduce<Record<string, Reservation[]>>((acc, reservation) => {
    // Only count active reservations (default to 'active' if status is undefined)
    if (reservation.status && reservation.status !== 'active') {
      return acc;
    }
    
    const dateKey = format(reservation.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(reservation);
    return acc;
  }, {});

  return (
    <div className="monthly-calendar" data-test="monthly-calendar">
      <div className="calendar-header" data-test="calendar-header">
        <button onClick={prevMonth} data-test="prev-month-button">&lt;</button>
        <h2 data-test="current-month-title">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} data-test="next-month-button">&gt;</button>
      </div>

      <div className="weekdays" data-test="weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday" data-test={`weekday-${day.toLowerCase()}`}>{day}</div>
        ))}
      </div>

      <div className="days" data-test="calendar-days">
        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayReservations = reservationsByDate[dateKey] || [];
          const hasReservations = dayReservations.length > 0;
          
          return (
            <div
              key={day.toString()}
              className={`day ${!isSameMonth(day, currentMonth) ? 'disabled' : ''} ${
                selectedDate && isSameDay(day, selectedDate) ? 'selected' : ''
              } ${hasReservations ? 'has-reservations' : ''}`}
              onClick={() => onDateSelect(day)}
              onMouseEnter={(e) => {
                if (dayReservations.length > 0) {
                  const userGroups = dayReservations.reduce<Record<string, { userName: string; count: number }>>((acc, reservation) => {
                    const userName = reservation.userName;
                    if (!acc[userName]) {
                      acc[userName] = { userName, count: 0 };
                    }
                    acc[userName].count++;
                    return acc;
                  }, {});
                  
                  const tooltipContent = Object.values(userGroups)
                    .map(userGroup => `${userGroup.userName} (${userGroup.count})`)
                    .join('\n');
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    visible: true,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                    content: tooltipContent
                  });
                }
              }}
              onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, content: '' })}
              data-test={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
            >
              <span className="day-number" data-test={`day-number-${format(day, 'd')}`}>{format(day, 'd')}</span>
              {hasReservations && (
                <div className="day-reservations" data-test={`day-reservations-${format(day, 'yyyy-MM-dd')}`}>
                  <div className="reservation-indicator" data-test={`reservation-indicator-${format(day, 'yyyy-MM-dd')}`}>
                    {dayReservations.length} {dayReservations.length === 1 ? 'reservation' : 'reservations'}
                  </div>
                  <div className="user-names-list" data-test={`user-names-${format(day, 'yyyy-MM-dd')}`}>
                    {(() => {
                      // Group reservations by user
                      const userGroups = dayReservations.reduce<Record<string, { userName: string; count: number }>>((acc, reservation) => {
                        const userName = reservation.userName;
                        if (!acc[userName]) {
                          acc[userName] = { userName, count: 0 };
                        }
                        acc[userName].count++;
                        return acc;
                      }, {});
                      
                      const groupedUsers = Object.values(userGroups).slice(0, 6);
                      const remainingUsers = Object.values(userGroups).length - 6;
                      
                      return (
                        <>
                          {groupedUsers.map((userGroup, index) => {
                             // Generate consistent colors based on user name hash
                             const colors = [
                               { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' }, // amber
                               { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' }, // blue
                               { bg: '#dcfce7', text: '#166534', border: '#22c55e' }, // green
                               { bg: '#fce7f3', text: '#be185d', border: '#ec4899' }, // pink
                               { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' }, // indigo
                               { bg: '#fed7d7', text: '#c53030', border: '#f56565' }  // red
                             ];
                             const colorIndex = userGroup.userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
                             const userColor = colors[colorIndex];
                             
                             return (
                               <div 
                                 key={userGroup.userName} 
                                 className="user-name-item"
                                 data-test={`user-name-${format(day, 'yyyy-MM-dd')}-${index}`}
                                 style={{
                                   fontSize: '0.6rem',
                                   color: userColor.text,
                                   backgroundColor: userColor.bg,
                                   border: `1px solid ${userColor.border}`,
                                   fontWeight: '600',
                                   lineHeight: '1.2',
                                   marginBottom: '2px',
                                   textAlign: 'center',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis',
                                   whiteSpace: 'nowrap',
                                   padding: '2px 4px',
                                   borderRadius: '4px',
                                   boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                                 }}
                               >
                                 {userGroup.userName} ({userGroup.count})
                               </div>
                             );
                           })}
                          {remainingUsers > 0 && (
                            <div 
                              className="more-users-indicator"
                              style={{
                                fontSize: '0.6rem',
                                color: '#92400e',
                                fontWeight: '600',
                                textAlign: 'center',
                                fontStyle: 'italic'
                              }}
                            >
                              +{remainingUsers} more users
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>


      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="calendar-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%) translateY(-100%)',
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '500',
            whiteSpace: 'pre-line',
            zIndex: 1000,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #374151',
            maxWidth: '200px',
            wordWrap: 'break-word'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default MonthlyCalendarView;