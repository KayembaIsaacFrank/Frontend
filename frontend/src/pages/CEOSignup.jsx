import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CEOSignup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...data } = formData;
      await signup('/auth/ceo-signup', data);
      alert('CEO created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
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
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-control" required />
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
