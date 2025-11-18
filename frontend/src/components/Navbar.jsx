/**
 * Navigation Bar Component
 * 
 * Purpose: Main navigation bar displayed on all authenticated pages
 * - Shows role-specific menu items
 * - Displays current user name and role
 * - Provides logout functionality
 * - Responsive Bootstrap navbar (collapses on mobile)
 * 
 * Features:
 * - Role-based menu visibility:
 *   - Sales Agent: Dashboard, Procurement, Sales, Credit Sales, Stock
 *   - CEO: All pages + Users management
 *   - Manager/Other: Dashboard, Analytics, Reports
 * - User info display (name and role)
 * - Settings link for all users
 * - Logout button
 * 
 * Dependencies:
 * - react-router-dom: Link and navigate
 * - AuthContext: Current user and logout function
 * - Bootstrap: Styling and responsive behavior
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();  // Get current user and logout function from context
  const navigate = useNavigate();      // React Router navigation function

  /**
   * Handle Logout
   * 
   * Clears authentication state and redirects to login page
   */
  const handleLogout = () => {
    logout();             // Clear user state and localStorage
    navigate('/login');   // Redirect to login page
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">  {/* Bootstrap responsive navbar */}
      <div className="container">
        {/* Brand/Logo - Links to dashboard */}
        <Link className="navbar-brand" to="/dashboard">GCDL</Link>  {/* Golden Crop Distributors Ltd */}
        
        {/* Mobile hamburger menu button */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* Collapsible navbar content */}
        <div className="collapse navbar-collapse" id="navbarNav">

          {/* Left-side navigation links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Dashboard link - visible to all roles */}
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            
            {/* Sales Agent specific links */}
            {user?.role === 'Sales Agent' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/procurement">Procurement</Link>  {/* Record stock purchases */}
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/sales">Sales</Link>  {/* Record sales transactions */}
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/credit-sales">Credit Sales</Link>  {/* Manage credit sales */}
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/stock">Stock</Link>  {/* View inventory */}
                </li>
              </>
            )}
            
            {/* Analytics link - visible to all roles */}
            <li className="nav-item">
              <Link className="nav-link" to="/analytics">Analytics</Link>
            </li>
            
            {/* Reports link - visible to all roles */}
            <li className="nav-item">
              <Link className="nav-link" to="/reports">Reports</Link>
            </li>
            
            {/* CEO-only link */}
            {user?.role === 'CEO' && (
              <li className="nav-item">
                <Link className="nav-link" to="/users">Users</Link>  {/* Manage managers and agents */}
              </li>
            )}
          </ul>

          {/* Right-side user info and actions */}
          <div className="d-flex align-items-center">
            {/* Settings button */}
            <Link to="/settings" className="btn btn-outline-light me-2">Settings</Link>
            
            {/* User info display */}
            <div className="me-3 text-white">
              {user?.full_name} <small className="text-light">({user?.role})</small>  {/* Show name and role */}
            </div>
            
            {/* Logout button */}
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
