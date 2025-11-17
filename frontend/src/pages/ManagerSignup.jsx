import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ManagerSignup = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    branch_id: '',
  });
  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        // Fetch branches (public)
        const br = await api.get('/branches');
        setBranches(br.data || []);
        
        // Try to fetch managers for validation (may fail if not authenticated)
        try {
          const mgr = await api.get('/users/managers');
          setManagers(mgr.data || []);
        } catch {
          // Ignore error - backend will validate on signup
          setManagers([]);
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
        setBranches([]);
        setManagers([]);
      }
    };
    run();
  }, []);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, branch_id: Number(form.branch_id) };
      await api.post('/auth/manager-signup', payload);
      alert('Manager account created! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
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
                <div className="mb-3">
                  <label className="form-label">Branch</label>
                  <select className="form-select" name="branch_id" value={form.branch_id} onChange={handleChange} required>
                    <option value="">Select branch</option>
                    {branches.map(b => {
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
