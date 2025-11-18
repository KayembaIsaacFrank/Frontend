/**
 * Sales Agent Signup Page Component
 * 
 * Purpose: Registration form for sales agents
 * - Branch selection with capacity enforcement
 * - Maximum 2 agents per branch allowed
 * - Fetches available branches dynamically
 * 
 * Features:
 * - Full name, email, phone inputs
 * - Branch selection dropdown (filtered by capacity)
 * - Password with confirmation
 * - Show/hide password toggles
 * 
 * Business Rule:
 * - MAXIMUM 2 sales agents per branch
 * - Branches at capacity (2 agents) are hidden from dropdown
 * - Backend validates agent limit per branch
 * 
 * Data Flow:
 * 1. useEffect fetches all branches and agents on mount
 * 2. Filters branches: only show those with <2 agents
 * 3. On submit: sends agent data + branch_id to backend
 * 4. Backend creates agent and associates with branch
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SalesAgentSignup = () => {
  // Form state - all sales agent registration fields
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    branch_id: '',  // Selected branch ID
  });
  
  const [branches, setBranches] = useState([]);      // All branches from backend
  const [agentsAll, setAgentsAll] = useState([]);    // All existing sales agents (for capacity check)
  const [error, setError] = useState('');             // Error message display
  const [loading, setLoading] = useState(false);     // Submit loading state
  const [showPassword, setShowPassword] = useState(false);  // Password visibility toggle
  const [showConfirm, setShowConfirm] = useState(false);    // Confirm password visibility
  const navigate = useNavigate();  // Navigation function

  /**
   * Fetch Branches and Sales Agents on Component Mount
   * 
   * Loads all branches and existing agents to determine which branches
   * have capacity for new agent assignment (max 2 agents per branch)
   */
  useEffect(() => {
    const run = async () => {
      try {
        // Fetch branches (public endpoint - no auth required)
        const br = await api.get('/branches');
        setBranches(br.data || []);
        
        // Try to fetch agents for UI filtering (may fail if not authenticated)
        try {
          const ag = await api.get('/users/agents');
          setAgentsAll(ag.data || []);  // Store for capacity calculation
        } catch {
          // Ignore error - backend will still validate on signup
          setAgentsAll([]);
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
        setBranches([]);
        setAgentsAll([]);
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
   * Creates new sales agent account with branch assignment
   * - Validates password confirmation
   * - Sends data to /auth/agent-signup endpoint
   * - Backend enforces max 2 agents per branch constraint
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
      
      // Call backend sales agent signup endpoint
      await api.post('/auth/agent-signup', payload);
      
      alert('Sales agent account created! Please login.');
      navigate('/login');  // Redirect to login page
    } catch (err) {
      // Display backend error (e.g., "Branch at capacity")
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
              <h2 className="h5 text-center mb-4">Sales Agent Signup</h2>
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
                {/* Branch Selection - shows only branches with <2 agents (max 2 per branch) */}
                <div className="mb-3">
                  <label className="form-label">Branch</label>
                  <select className="form-select" name="branch_id" value={form.branch_id} onChange={handleChange} required>
                    <option value="">Select branch</option>
                    {/* Filter: Only show branches with fewer than 2 agents */}
                    {branches
                      .filter(b => (agentsAll.filter(a => a.branch && a.branch.id === b.id).length < 2))
                      .map(b => (
                        <option key={b.id} value={`${b.id}`}>{b.name} - {b.location}</option>
                      ))}
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

export default SalesAgentSignup;
