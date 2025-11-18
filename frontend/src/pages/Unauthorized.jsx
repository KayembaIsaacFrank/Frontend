/**
 * Unauthorized Page Component
 * 
 * Purpose: Error page shown when user tries to access route they don't have permission for
 * - Displayed by ProtectedRoute when user lacks required role
 * - Simple centered error message
 * - Link back to dashboard
 * 
 * Usage:
 * - CEO tries to access sales agent-only route
 * - Manager tries to access CEO-only route
 * - Sales agent tries to access manager-only route
 * 
 * Features:
 * - Full viewport height centering
 * - Large error heading
 * - Explanatory message
 * - Button to return to dashboard
 */

import React from 'react';

const Unauthorized = () => {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center">
        <h1 className="display-4 text-danger mb-4">Unauthorized</h1>
        <p className="lead text-muted mb-4">You don't have permission to access this page.</p>
        <a href="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</a>
      </div>
    </div>
  );
};

export default Unauthorized;
