import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">GCDL</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">


          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            {user?.role !== 'CEO' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/procurement">Procurement</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/sales">Sales</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/credit-sales">Credit Sales</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/stock">Stock</Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/analytics">Analytics</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reports">Reports</Link>
            </li>
            {user?.role === 'CEO' && (
              <li className="nav-item">
                <Link className="nav-link" to="/users">Users</Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            <Link to="/settings" className="btn btn-outline-light me-2">Settings</Link>
            <div className="me-3 text-white">{user?.full_name} <small className="text-light">({user?.role})</small></div>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
