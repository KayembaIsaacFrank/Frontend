/**
 * Authentication Context - Global State Management
 * 
 * Purpose: Provides global authentication state and functions to entire application
 * - Manages current logged-in user
 * - Handles login/logout operations
 * - Persists authentication state in localStorage
 * - Provides loading and error states
 * 
 * Features:
 * - User object with role, branch_id, email, full_name
 * - JWT token management
 * - Automatic state persistence across page refreshes
 * - Centralized authentication logic
 * 
 * Usage:
 * - Wrap app in <AuthProvider>
 * - Access auth state with useAuth() hook
 * - Call login(email, password) to authenticate
 * - Call logout() to clear session
 */

import React, { createContext, useState, useContext } from 'react';
import api from '../utils/api';  // Axios instance with interceptors

// Create authentication context
const AuthContext = createContext();

/**
 * AuthProvider Component
 * 
 * Provides authentication state and functions to all child components
 * State is initialized from localStorage to persist across page refreshes
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const AuthProvider = ({ children }) => {
  // User state - initialized from localStorage for persistence
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');  // Check if user was previously logged in
    return savedUser ? JSON.parse(savedUser) : null; // Parse JSON or return null
  });
  
  // Loading state for async operations
  const [loading, setLoading] = useState(false);
  
  // Error state for displaying authentication errors
  const [error, setError] = useState(null);

  /**
   * Login Function
   * 
   * Authenticates user with email and password
   * - Calls backend /api/auth/login endpoint
   * - Stores JWT token and user data in localStorage
   * - Updates user state
   * 
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Promise<Object>} User object with role, branch_id, etc.
   * @throws {Error} If login fails
   */
  const login = async (email, password) => {
    setLoading(true);   // Show loading state
    setError(null);     // Clear any previous errors
    try {
      // Call backend login API
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      // Persist authentication data in localStorage
      localStorage.setItem('token', token);  // JWT token for API requests
      localStorage.setItem('user', JSON.stringify(userData));  // User info
      
      // Update state
      setUser(userData);
      return userData;
    } catch (err) {
      // Handle login errors
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);  // Propagate error to calling component
    } finally {
      setLoading(false);  // Always stop loading state
    }
  };

  /**
   * Logout Function
   * 
   * Clears authentication state and localStorage
   * - Removes JWT token
   * - Removes user data
   * - Resets user state to null
   */
  const logout = () => {
    localStorage.removeItem('token');  // Remove JWT token
    localStorage.removeItem('user');   // Remove user data
    setUser(null);                     // Clear state
  };

  /**
   * Signup Function
   * 
   * Generic signup function for all user types
   * Used by CEO, Manager, and Sales Agent signup forms
   * 
   * @param {string} endpoint - API endpoint (e.g., '/auth/ceo-signup')
   * @param {Object} data - User registration data
   * @returns {Promise<Object>} Response from backend
   * @throws {Error} If signup fails
   */
  const signup = async (endpoint, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(endpoint, data);
      return response.data;  // Return success message
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Signup failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Provide auth state and functions to all child components
  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, signup }}>
      {children}  {/* All app components */}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context
 * Provides user state and auth functions to any component
 * 
 * @returns {Object} Auth context value
 * @returns {Object|null} return.user - Current logged-in user or null
 * @returns {boolean} return.loading - Loading state for async operations
 * @returns {string|null} return.error - Error message or null
 * @returns {Function} return.login - Login function
 * @returns {Function} return.logout - Logout function
 * @returns {Function} return.signup - Signup function
 * 
 * @throws {Error} If used outside AuthProvider
 * 
 * Usage:
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Ensure hook is used within AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;  // Return { user, loading, error, login, logout, signup }
};
