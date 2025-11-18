/**
 * Manager Signup Page Component
 * 
 * Purpose: Registration form for branch managers
 * - Branch selection with business rule enforcement
 * - Only allows assignment to branches without existing managers
 * - Fetches available branches dynamically
 * 
 * Features:
 * - Full name, email, phone inputs
 * - Branch selection dropdown (filtered)
 * - Password with confirmation
 * - Show/hide password toggles
 * 
 * Business Rule:
 * - ONE manager per branch maximum
 * - Branches with existing managers are disabled in dropdown
 * - Backend validates unique manager constraint
 * 
 * Data Flow:
 * 1. useEffect fetches all branches and managers on mount
 * 2. Filters branches to disable those with managers
 * 3. On submit: sends manager data + branch_id to backend
 * 4. Backend creates manager and associates with branch
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ManagerSignup = () => {
  // Form state - all manager registration fields
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    branch_id: '',  // Selected branch ID
  });
  
  const [branches, setBranches] = useState([]);  // All branches from backend
  const [managers, setManagers] = useState([]);  // All existing managers (for filtering)
  const [error, setError] = useState('');         // Error message display
  const [loading, setLoading] = useState(false);  // Submit loading state
  const [showPassword, setShowPassword] = useState(false);  // Password visibility toggle
  const [showConfirm, setShowConfirm] = useState(false);    // Confirm password visibility
  const navigate = useNavigate();  // Navigation function

  /**
   * Fetch Branches and Managers on Component Mount
   * 
   * Loads all branches and existing managers to determine which branches
   * are available for new manager assignment (1 manager per branch rule)
   */
  useEffect(() => {
    const run = async () => {
      try {
        // Fetch branches (public endpoint - no auth required)
        const br = await api.get('/branches');
        setBranches(br.data || []);
        
        // Try to fetch managers for UI filtering (may fail if not authenticated)
        try {
          const mgr = await api.get('/users/managers');
          setManagers(mgr.data || []);  // Store for dropdown filtering
        } catch {
          // Ignore error - backend will still validate on signup
          setManagers([]);
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
        setBranches([]);
        setManagers([]);
      }
    };
    run();
  }, []);  // Run once on mount

  /**
   * Handle Form Field Changes
   * 
   * Updates form state when user types in any input field
   * 
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));  // Update specific field by name
  };

  /**
   * Handle Form Submission
   * 
   * Creates new manager account with branch assignment
   * - Validates password confirmation
   * - Sends data to /auth/manager-signup endpoint
   * - Backend enforces unique manager per branch constraint
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload
    setError('');        // Clear previous errors
    
    // Frontend validation: Password confirmation must match
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);  // Show loading state
    
    try {
      // Convert branch_id to number for backend
      const payload = { ...form, branch_id: Number(form.branch_id) };
      
      // Call backend manager signup endpoint
      await api.post('/auth/manager-signup', payload);
      
      alert('Manager account created! Please login.');
      navigate('/login');  // Redirect to login page
    } catch (err) {
      // Display backend error (e.g., "Branch already has a manager")
      setError(err?.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);  // Always stop loading state
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="h5 text-center mb-4">Manager Signup</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                </div>
                {/* Branch Selection - enforces one manager per branch */}
                <div className="mb-3">
                  <label className="form-label">Branch</label>
                  <select className="form-select" name="branch_id" value={form.branch_id} onChange={handleChange} required>
                    <option value="">Select branch</option>
                    {branches.map(b => {
                      // Check if branch already has a manager assigned
                      const hasManager = managers.some(m => m.branch && m.branch.id === b.id);
                      return (
                        <option key={b.id} value={`${b.id}`} disabled={hasManager}>
                          {b.name} - {b.location}{hasManager ? ' (Managed)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input type={showPassword ? 'text' : 'password'} className="form-control" name="password" value={form.password} onChange={handleChange} required />
                    <button type="button" className="btn btn-outline-secondary" tabIndex="-1" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <input type={showConfirm ? 'text' : 'password'} className="form-control" name="confirm_password" value={form.confirm_password} onChange={handleChange} required />
                    <button type="button" className="btn btn-outline-secondary" tabIndex="-1" onClick={() => setShowConfirm(v => !v)}>{showConfirm ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
              </form>
              <p className="text-center mt-3">Already have an account? <a href="/login">Login</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSignup;
