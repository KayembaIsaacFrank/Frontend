import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Role is for user awareness only; backend still authenticates by email/password
      await login(email, password);
      navigate('/dashboard');
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
              <h2 className="h5 text-center mb-4">Login</h2>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}


              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">User Type</label>
                  <select className="form-select" value={role} onChange={e => setRole(e.target.value)} required>
                    <option value="">Select user type</option>
                    <option value="CEO">CEO</option>
                    <option value="Manager">Manager</option>
                    <option value="Sales Agent">Sales Agent</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" required />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-100">
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <p className="text-center mt-3">
                No account? <a href="/ceo-signup">CEO Signup</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
