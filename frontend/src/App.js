// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login           from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';
import Dashboard       from './pages/Dashboard';
import Properties      from './pages/Properties';
import Bonds           from './pages/Bonds';
import Inspections     from './pages/Inspections';
import Documents       from './pages/Documents';
import Profile         from './pages/Profile';
import AdminDashboard  from './pages/AdminDashboard';
import ChatBot         from './components/ChatBot';
import ToastContainer  from './components/Toast';

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.token)           return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Public */}
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User pages */}
        <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/properties"  element={<PrivateRoute><Properties /></PrivateRoute>} />
        <Route path="/bonds"       element={<PrivateRoute><Bonds /></PrivateRoute>} />
        <Route path="/inspections" element={<PrivateRoute><Inspections /></PrivateRoute>} />
        <Route path="/documents"   element={<PrivateRoute><Documents /></PrivateRoute>} />
        <Route path="/profile"     element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ChatBot />
    </Router>
  );
}

export default App;