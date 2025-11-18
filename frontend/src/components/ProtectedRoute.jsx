/**
 * Protected Route Component
 * 
 * Purpose: Route guard that enforces authentication and role-based access control
 * - Redirects to login if user not authenticated
 * - Redirects to unauthorized page if user lacks required role
 * - Allows access if authentication and role requirements are met
 * 
 * Usage:
 * <ProtectedRoute>                           // Any authenticated user
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requiredRole="CEO">       // Only CEO can access
 *   <Users />
 * </ProtectedRoute>
 * 
 * Security Flow:
 * 1. Check if user is authenticated (user object exists)
 * 2. If not authenticated → redirect to /login
 * 3. If requiredRole specified, check if user.role matches
 * 4. If role mismatch → redirect to /unauthorized
 * 5. If all checks pass → render child component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {string} [props.requiredRole] - Optional role requirement (e.g., 'CEO', 'Manager', 'Sales Agent')
 * @returns {JSX.Element} Child component or Navigate redirect
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();  // Get current user from auth context

  // Authentication check: If no user logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;  // replace prevents back button from returning here
  }

  // Role authorization check: If specific role required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;  // Redirect to access denied page
  }

  // All checks passed - render the protected component
  return children;
};

export default ProtectedRoute;
