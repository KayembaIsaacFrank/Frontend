/**
 * Login Page Component
 * 
 * Purpose: Main authentication page for all user types
 * - Supports CEO, Manager, Sales Agent login
 * - Role selection for user awareness (not used in auth)
 * - Password visibility toggle
 * - Links to appropriate signup pages
 * 
 * Features:
 * - Email and password authentication
 * - Role dropdown (informational only - backend determines actual role)
 * - Show/hide password toggle
 * - Conditional signup links based on selected role
 * - Error message display
 * - Loading state during authentication
 * 
 * Authentication Flow:
 * 1. User enters email and password
 * 2. Calls AuthContext.login(email, password)
 * 3. Backend validates credentials and returns JWT + user object
 * 4. Redirects to /dashboard (role-based rendering happens there)
 * 
 * Security:
 * - Passwords never stored in state longer than needed
 * - JWT token handled by AuthContext
 * - Form prevents default submission
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');  // Informational only - helps show relevant signup links
  const [error, setError] = useState('');  // Error message display
  const [loading, setLoading] = useState(false);  // Loading state during login
  const [showPassword, setShowPassword] = useState(false);  // Password visibility toggle
  
  const { login } = useAuth();  // Get login function from auth context
  const navigate = useNavigate();  // Navigation function

  /**
   * Handle Login Form Submission
   * 
   * Authenticates user with backend and redirects to dashboard
   * Note: Role selection is for UI only - backend determines actual user role
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload
    setError('');        // Clear previous errors
    setLoading(true);    // Show loading state

    try {
      // Role is for user awareness only; backend still authenticates by email/password
      await login(email, password);  // Call AuthContext login function
      navigate('/dashboard');        // Redirect to dashboard on success
    } catch (err) {
      setError(err.message);  // Display error message
    } finally {
      setLoading(false);     // Always stop loading state
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">  {/* Responsive card width */}
          <div className="card shadow">
            <div className="card-body">
              {/* Application branding */}
              <h1 className="card-title text-center mb-1">GCDL</h1>  {/* Golden Crop Distributors Ltd */}
              <h2 className="h5 text-center mb-4">Login</h2>

              {/* Error message display */}
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                {/* User Type Selection - helps show relevant signup links */}
                <div className="mb-3">
                  <label className="form-label">User Type</label>
                  <select className="form-select" value={role} onChange={e => setRole(e.target.value)} required>
                    <option value="">Select user type</option>
                    <option value="CEO">CEO</option>
                    <option value="Manager">Manager</option>
                    <option value="Sales Agent">Sales Agent</option>
                  </select>
                  {/* Future: Buyer login option */}
                  {/* <div className="form-text">
                    <span className="text-muted">Are you a buyer? </span>
                    <a href="/buyer-signup">Sign up here</a> or <a href="/login-buyer">login as buyer</a>.
                  </div> */}
                </div>
                
                {/* Email input */}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" required />
                </div>
                
                {/* Password input with show/hide toggle */}
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="form-control" 
                      required 
                    />
                    {/* Toggle password visibility */}
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      tabIndex="-1" 
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Submit button with loading state */}
                <button type="submit" disabled={loading} className="btn btn-primary w-100">
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              
              {/* Signup links - conditional based on selected role */}
              <div className="text-center mt-3">
                <div className="mb-1">No account?</div>
                {/* Show all signup options if no role selected */}
                {role === '' && (
                  <div className="d-flex flex-column gap-1">
                    <a href="/ceo-signup">Sign up as CEO</a>
                    <a href="/manager-signup">Sign up as Manager</a>
                    <a href="/sales-agent-signup">Sign up as Sales Agent</a>
                  </div>
                )}
                {/* Show role-specific signup link */}
                {role === 'CEO' && (<a href="/ceo-signup">Sign up as CEO</a>)}
                {role === 'Manager' && (<a href="/manager-signup">Sign up as Manager</a>)}
                {role === 'Sales Agent' && (<a href="/sales-agent-signup">Sign up as Sales Agent</a>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
