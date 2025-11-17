import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setSuccess('Password changed successfully. Please log in again.');
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.body.setAttribute('data-theme', nextTheme);
  };

  React.useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Settings</h2>
      <div className="mb-4">
        <button className="btn btn-outline-secondary" onClick={handleThemeToggle} aria-label="Toggle theme" style={{fontSize: '1.5rem', lineHeight: 1}}>
          {theme === 'light' ? (
            <span role="img" aria-label="Switch to dark mode">🌙</span>
          ) : (
            <span role="img" aria-label="Switch to light mode">☀️</span>
          )}
        </button>
      </div>
      <div className="card" style={{maxWidth: 500}}>
        <div className="card-header">Change Password</div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handlePasswordChange}>
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-control" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-control" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
