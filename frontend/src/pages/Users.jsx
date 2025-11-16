import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Users = () => {
  const [managers, setManagers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState([]);

  const [mgrForm, setMgrForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    branch_id: '',
  });
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [mgrRes, agRes, brRes] = await Promise.all([
        api.get('/users/managers'),
        api.get('/users/agents'),
        api.get('/branches'),
      ]);
      setManagers(mgrRes.data || []);
      setAgents(agRes.data || []);
      setBranches(brRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex align-items-center mb-3">
          <h1 className="h3 mb-0 me-3">User Management</h1>
          <button className="btn btn-outline-secondary btn-sm" onClick={loadData} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* CEO: Create Manager */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">Create Manager</div>
              <div className="card-body">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setError('');
                    setCreating(true);
                    try {
                      const payload = {
                        email: mgrForm.email,
                        password: mgrForm.password,
                        full_name: mgrForm.full_name,
                        phone: mgrForm.phone,
                        branch_id: mgrForm.branch_id ? Number(mgrForm.branch_id) : undefined,
                      };
                      await api.post('/auth/create-manager', payload);
                      setMgrForm({ email: '', password: '', full_name: '', phone: '', branch_id: '' });
                      await loadData();
                    } catch (er) {
                      setError(er?.response?.data?.error || 'Failed to create manager');
                    } finally {
                      setCreating(false);
                    }
                  }}
                >
                  <div className="row g-3">
                    <div className="col-12 col-md-3">
                      <label className="form-label">Full Name</label>
                      <input className="form-control" value={mgrForm.full_name} onChange={(e)=>setMgrForm(f=>({...f, full_name:e.target.value}))} required />
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={mgrForm.email} onChange={(e)=>setMgrForm(f=>({...f, email:e.target.value}))} required />
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label">Phone</label>
                      <input className="form-control" value={mgrForm.phone} onChange={(e)=>setMgrForm(f=>({...f, phone:e.target.value}))} />
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" value={mgrForm.password} onChange={(e)=>setMgrForm(f=>({...f, password:e.target.value}))} required />
                    </div>
                    <div className="col-12 col-md-3">
                      <label className="form-label">Branch</label>
                      <select className="form-select" value={mgrForm.branch_id} onChange={(e)=>setMgrForm(f=>({...f, branch_id:e.target.value}))} required>
                        <option value="">Select branch</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 d-flex align-items-end">
                      <button className="btn btn-primary" type="submit" disabled={creating}>
                        {creating ? 'Creating…' : 'Create Manager'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card">
              <div className="card-header">Managers</div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Branch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No managers yet</td>
                        </tr>
                      )}
                      {managers.map((m, idx) => (
                        <tr key={m.id}>
                          <td>{idx + 1}</td>
                          <td>{m.full_name}</td>
                          <td>{m.email}</td>
                          <td>{m.branch ? m.branch.name : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card">
              <div className="card-header">Sales Agents</div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Branch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No agents yet</td>
                        </tr>
                      )}
                      {agents.map((a, idx) => (
                        <tr key={a.id}>
                          <td>{idx + 1}</td>
                          <td>{a.full_name}</td>
                          <td>{a.email}</td>
                          <td>{a.branch ? a.branch.name : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
