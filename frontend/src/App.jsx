import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerDashboard from './pages/ManagerDashboard';
import SalesAgentDashboard from './pages/SalesAgentDashboard';
import BuyerDashboard from './pages/BuyerDashboard';

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
import BuyerSignup from './pages/BuyerSignup';
import LoginBuyer from './pages/LoginBuyer';

import './index.css';

// Role-based dashboard component
function RoleBasedDashboard() {
  const { user } = useAuth();
  if (!user) return <Dashboard />;
  switch (user.role) {
    case 'manager':
      return <ManagerDashboard />;
    case 'sales_agent':
      return <SalesAgentDashboard />;
    case 'buyer':
      return <BuyerDashboard />;
    default:
      return <Dashboard />;
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/ceo-signup" element={<CEOSignup />} />
          <Route path="/buyer-signup" element={<BuyerSignup />} />
          <Route path="/login-buyer" element={<LoginBuyer />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
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
