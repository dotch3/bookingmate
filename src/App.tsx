import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import CalendarView from './calendar/CalendarView';
import AdminPanel from './admin/AdminPanel';
import Header from './components/Header';
import ReservationList from './reservations/ReservationList';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<CalendarView />} />
          <Route path="/reservas" element={<ReservationList />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;