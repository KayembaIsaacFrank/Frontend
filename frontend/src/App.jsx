/**
 * Main Application Component - Routing and Authentication
 * 
 * Purpose: Configures React Router and defines all application routes
 * - Sets up client-side routing for SPA navigation
 * - Wraps app in AuthProvider for global authentication state
 * - Defines public routes (login, signup) and protected routes (dashboard, etc.)
 * - Implements role-based routing for different user types
 * 
 * Route Structure:
 * - Public: /login, /ceo-signup, /manager-signup, /sales-agent-signup
 * - Protected: /dashboard, /procurement, /sales, /credit-sales, /stock, /analytics, /reports, /users
 * - Role-specific: CEO-only routes, Sales Agent-only routes, etc.
 * 
 * Dependencies:
 * - react-router-dom: Client-side routing
 * - AuthContext: Global authentication state
 * - ProtectedRoute: Route guard component
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
// import ManagerDashboard from './pages/ManagerDashboard';  // Commented out - using generic Dashboard
import SalesAgentDashboard from './pages/SalesAgentDashboard';  // Sales agent specific dashboard

// Page Components - All route components for the application
import Login from './pages/Login';                      // Login page for all users
import CEOSignup from './pages/CEOSignup';              // CEO self-registration
import ManagerSignup from './pages/ManagerSignup';      // Manager self-registration
import SalesAgentSignup from './pages/SalesAgentSignup'; // Sales agent self-registration
import Dashboard from './pages/Dashboard';               // Generic/CEO dashboard
import Procurement from './pages/Procurement';           // Procurement management (Sales Agent)
import Sales from './pages/Sales';                       // Sales recording (Sales Agent)
import CreditSales from './pages/CreditSales';           // Credit sales management
import Stock from './pages/Stock';                       // Stock/inventory viewing
import Analytics from './pages/Analytics';               // Analytics and charts
import Reports from './pages/Reports';                   // Report generation and export
// import Buyers from './pages/Buyers';                  // Buyer management (future feature)
import Users from './pages/Users';                       // User management (CEO only)
import Unauthorized from './pages/Unauthorized';         // Access denied page
// import BuyerSignup from './pages/BuyerSignup';        // Buyer self-registration (future)
// import LoginBuyer from './pages/LoginBuyer';          // Separate buyer login (future)

import Settings from './pages/Settings';                 // User settings page
import './index.css';                                    // Global CSS styles

/**
 * Role-Based Dashboard Component
 * 
 * Renders different dashboard based on user role:
 * - Sales Agent → SalesAgentDashboard (comprehensive tab-based dashboard)
 * - CEO/Manager/Other → Generic Dashboard
 * - No user → Generic Dashboard (should not happen with ProtectedRoute)
 * 
 * @returns {JSX.Element} Appropriate dashboard component for user role
 */
function RoleBasedDashboard() {
  const { user } = useAuth();  // Get current user from auth context
  
  // Fallback if no user (shouldn't happen with ProtectedRoute)
  if (!user) return <Dashboard />;
  
  // Switch dashboard based on user role
  switch (user.role) {
    case 'Sales Agent':
      return <SalesAgentDashboard />;  // Specialized dashboard with procurement/sales tabs
    default:
      return <Dashboard />;            // Generic dashboard for CEO/Manager
  }
}

/**
 * Main App Component
 * 
 * Sets up routing and authentication for the entire application
 * - Router: Enables client-side routing (SPA navigation)
 * - AuthProvider: Provides global authentication state to all components
 * - Routes: Defines all URL paths and their corresponding components
 * 
 * Route Types:
 * 1. Public Routes: Accessible without authentication (login, signup)
 * 2. Protected Routes: Require authentication (wrapped in ProtectedRoute)
 * 3. Role-Specific Routes: Require specific role (e.g., CEO-only, Sales Agent-only)
 * 
 * @returns {JSX.Element} Complete application with routing
 */
function App() {
  return (
    <Router>  {/* Enables client-side routing */}
      <AuthProvider>  {/* Provides authentication state to all child components */}
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          {/* Accessible without authentication */}
          
          <Route path="/login" element={<Login />} />  {/* Main login page */}
          <Route path="/ceo-signup" element={<CEOSignup />} />  {/* CEO self-registration */}
          <Route path="/manager-signup" element={<ManagerSignup />} />  {/* Manager self-registration */}
          <Route path="/sales-agent-signup" element={<SalesAgentSignup />} />  {/* Sales agent self-registration */}
          {/* <Route path="/buyer-signup" element={<BuyerSignup />} /> */}  {/* Future: Buyer registration */}
          {/* <Route path="/login-buyer" element={<LoginBuyer />} /> */}  {/* Future: Separate buyer login */}
          
          {/* ==================== PROTECTED ROUTES ==================== */}
          {/* Require authentication (valid JWT token) */}
          {/* Dashboard - Role-based rendering */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>  {/* Requires authentication, any role */}
                <RoleBasedDashboard />  {/* Shows different dashboard based on user.role */}
              </ProtectedRoute>
            }
          />
          
          {/* Procurement - Sales Agent only */}
          <Route
            path="/procurement"
            element={
              <ProtectedRoute requiredRole="Sales Agent">  {/* Only Sales Agents can access */}
                <Procurement />  {/* Record stock purchases */}
              </ProtectedRoute>
            }
          />
          
          {/* Sales - Sales Agent only */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute requiredRole="Sales Agent">  {/* Only Sales Agents can access */}
                <Sales />  {/* Record cash and credit sales */}
              </ProtectedRoute>
            }
          />
          
          {/* Credit Sales - All authenticated users */}
          <Route
            path="/credit-sales"
            element={
              <ProtectedRoute>  {/* Any authenticated user */}
                <CreditSales />  {/* View/manage credit sales, Manager can approve */}
              </ProtectedRoute>
            }
          />
          
          {/* Stock - All authenticated users */}
          <Route
            path="/stock"
            element={
              <ProtectedRoute>  {/* Any authenticated user */}
                <Stock />  {/* View current inventory levels */}
              </ProtectedRoute>
            }
          />
          
          {/* Analytics - All authenticated users */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>  {/* Any authenticated user */}
                <Analytics />  {/* View analytics and charts */}
              </ProtectedRoute>
            }
          />
          
          {/* Reports - All authenticated users */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>  {/* Any authenticated user */}
                <Reports />  {/* Generate and export reports */}
              </ProtectedRoute>
            }
          />
          
          {/* Buyers - Future feature (commented out) */}
          {/* <Route
            path="/buyers"
            element={
              <ProtectedRoute>
                <Buyers />
              </ProtectedRoute>
            }
          /> */}
          
          {/* Users - CEO only */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="CEO">  {/* Only CEO can access */}
                <Users />  {/* Create/manage managers and sales agents */}
              </ProtectedRoute>
            }
          />
          
          {/* Unauthorized - Public error page */}
          <Route path="/unauthorized" element={<Unauthorized />} />  {/* Shown when user lacks required role */}
          
          {/* Settings - All authenticated users */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>  {/* Any authenticated user */}
                <Settings />  {/* User profile and account settings */}
              </ProtectedRoute>
            }
          />

          {/* Default Route - Redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />  {/* Root path redirects to dashboard */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
