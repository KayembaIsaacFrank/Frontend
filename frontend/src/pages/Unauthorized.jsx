import React from 'react';

const Unauthorized = () => {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center">
        <h1 className="display-4 text-danger mb-4">Unauthorized</h1>
        <p className="lead text-muted mb-4">You don't have permission to access this page.</p>
        <a href="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</a>
      </div>
    </div>
  );
};

export default Unauthorized;
