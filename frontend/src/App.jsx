/**
 * Main App component with routing
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SendMessage from './pages/SendMessage';
import ReceiveMessage from './pages/ReceiveMessage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/send"
          element={
            <PrivateRoute>
              <SendMessage />
            </PrivateRoute>
          }
        />
        <Route
          path="/receive"
          element={
            <PrivateRoute>
              <ReceiveMessage />
            </PrivateRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
