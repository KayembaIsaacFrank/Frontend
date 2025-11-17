import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginBuyer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/buyer-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h1 className="card-title text-center mb-1">GCDL</h1>
              <h2 className="h5 text-center mb-4">Buyer Login</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="form-control" required />
                    <button type="button" className="btn btn-outline-secondary" tabIndex="-1" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-100">
                  {loading ? 'Logging in...' : 'Login as Buyer'}
                </button>
              </form>
              <p className="text-center mt-3">
                No account? <a href="/buyer-signup">Buyer Signup</a>
              </p>
              <p className="text-center mt-1">
                <a href="/login">Back to User Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBuyer;
