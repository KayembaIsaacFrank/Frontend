import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import CEOSignup from './pages/CEOSignup';
import Dashboard from './pages/Dashboard';
import Procurement from './pages/Procurement';
import Sales from './pages/Sales';
import CreditSales from './pages/CreditSales';
import Stock from './pages/Stock';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Buyers from './pages/Buyers';
import Users from './pages/Users';
import Unauthorized from './pages/Unauthorized';

import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/ceo-signup" element={<CEOSignup />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/procurement"
            element={
              <ProtectedRoute>
                <Procurement />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/credit-sales"
            element={
              <ProtectedRoute>
                <CreditSales />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/stock"
            element={
              <ProtectedRoute>
                <Stock />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/buyers"
            element={
              <ProtectedRoute>
                <Buyers />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="CEO">
                <Users />
              </ProtectedRoute>
            }
          />
          
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
