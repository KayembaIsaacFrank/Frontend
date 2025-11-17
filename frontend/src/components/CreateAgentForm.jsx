import React, { useState } from 'react';
import api from '../utils/api';

const CreateAgentForm = ({ branchId, onCreated }) => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    branch_id: branchId || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      // Always use branchId prop if provided (manager context)
      const payload = {
        ...form,
        branch_id: branchId ? Number(branchId) : Number(form.branch_id)
      };
      await api.post('/auth/create-agent', payload);
      setForm({ full_name: '', email: '', phone: '', password: '', confirm_password: '', branch_id: branchId || '' });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <label className="form-label">Full Name</label>
          <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} required />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Phone</label>
          <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input type={showPassword ? 'text' : 'password'} className="form-control" name="password" value={form.password} onChange={handleChange} required />
            <button type="button" className="btn btn-outline-secondary" tabIndex="-1" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Confirm Password</label>
          <div className="input-group">
            <input type={showConfirm ? 'text' : 'password'} className="form-control" name="confirm_password" value={form.confirm_password} onChange={handleChange} required />
            <button type="button" className="btn btn-outline-secondary" tabIndex="-1" onClick={() => setShowConfirm(v => !v)}>{showConfirm ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        {/* Hide branch_id input if passed as prop (manager context) */}
        {!branchId && (
          <div className="col-12 col-md-4">
            <label className="form-label">Branch ID</label>
            <input className="form-control" name="branch_id" value={form.branch_id} onChange={handleChange} required />
          </div>
        )}
        <div className="col-12 d-flex align-items-end">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Agent'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateAgentForm;
