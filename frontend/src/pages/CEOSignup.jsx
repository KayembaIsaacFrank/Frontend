/**
 * CEO Signup Page Component
 * 
 * Purpose: Self-registration form for CEO (first-time setup)
 * - Only one CEO allowed in system
 * - No authentication required (public endpoint)
 * - Password confirmation validation
 * - Redirects to login after successful creation
 * 
 * Features:
 * - Full name, email, phone inputs
 * - Password with confirmation
 * - Show/hide password toggles
 * - Frontend password match validation
 * - Backend validates no existing CEO
 * 
 * Business Rule:
 * - Only ONE CEO can exist in the entire system
 * - If CEO already exists, backend returns error
 * 
 * Security:
 * - Password hashed on backend (bcrypt)
 * - No sensitive data stored in component state after submission
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CEOSignup = () => {
  // Form state - all CEO registration fields
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',  // Frontend-only validation field
    full_name: '',
    phone: '',
  });
  
  const [error, setError] = useState('');  // Error message display
  const [loading, setLoading] = useState(false);  // Loading state
  const [showPassword, setShowPassword] = useState(false);  // Password visibility
  const [showConfirm, setShowConfirm] = useState(false);  // Confirm password visibility
  
  const { signup } = useAuth();  // Get signup function from context
  const navigate = useNavigate();  // Navigation function

  /**
   * Handle Form Field Changes
   * 
   * Updates form state when user types in any input field
   * 
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,  // Update specific field by name attribute
    }));
  };

  /**
   * Handle Form Submission
   * 
   * Validates passwords match and creates CEO account
   * - Frontend: Checks password confirmation
   * - Backend: Validates no existing CEO, hashes password, creates user
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload
    setError('');        // Clear previous errors

    // Frontend validation: Password confirmation must match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);  // Show loading state

    try {
      // Transform data for backend (snake_case)
      const data = {
        ...formData,
        confirm_password: formData.confirmPassword,  // Backend expects confirm_password
      };
      delete data.confirmPassword;  // Remove camelCase version
      
      // Call backend CEO signup endpoint
      await signup('/auth/ceo-signup', data);
      
      alert('CEO created successfully! Please login.');
      navigate('/login');  // Redirect to login page
    } catch (err) {
      setError(err.message);  // Display backend error (e.g., "CEO already exists")
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
              <h1 className="card-title text-center mb-1">GCDL</h1>
              <h2 className="h5 text-center mb-4">CEO Signup</h2>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="form-control" required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="form-control" required />
                    <button type="button" className="btn btn-outline-secondary" tabIndex="-1" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-control" required />
                    <button type="button" className="btn btn-outline-secondary" tabIndex="-1" onClick={() => setShowConfirm(v => !v)}>{showConfirm ? 'Hide' : 'Show'}</button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-100">{loading ? 'Creating account...' : 'Create CEO Account'}</button>
              </form>

              <p className="text-center mt-3">Already have account? <a href="/login">Login</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEOSignup;
