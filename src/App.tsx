import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/AuthProvider';
import { useAuthRole } from './auth/useAuthRole';
import CalendarView from './calendar/CalendarView';
import AdminPanel from './admin/AdminPanel';
import Header from './components/Header';
import ReservationList from './reservations/ReservationList';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionStatus from './components/ConnectionStatus';
import Login from './auth/Login';



//test smoke test
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/firebase";

async function smokeTest() {
  const snapshot = await getDocs(collection(db, "reservations"));
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
  });
}

smokeTest();


// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactElement; requiredRole?: string }> = ({ 
  element, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  const { role } = useAuthRole();
  
  if (loading) return <div className="loading">Loading...</div>;
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Header />
          <ConnectionStatus />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute element={<CalendarView />} />} />
            <Route path="/reservations" element={<ProtectedRoute element={<ReservationList />} />} />
            <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} requiredRole="admin" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;