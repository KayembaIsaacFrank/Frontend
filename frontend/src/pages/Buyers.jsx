import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Buyers = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', location: '' });

  const loadBuyers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/buyers');
      setList(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load buyers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBuyers(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const payload = { ...form };
      if (!payload.name) { setError('Name required'); setLoading(false); return; }
      await api.post('/buyers', payload);
      setForm({ name: '', phone: '', email: '', location: '' });
      await loadBuyers();
      alert('Buyer created');
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to create buyer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex align-items-center mb-3">
          <h1 className="h3 mb-0 me-3">Buyers</h1>
          <button className="btn btn-outline-secondary btn-sm" onClick={loadBuyers} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card mb-4">
          <div className="card-header">Add Buyer</div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} required />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={(e)=>setForm(f=>({...f, phone:e.target.value}))} />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))} />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Location</label>
                  <input className="form-control" value={form.location} onChange={(e)=>setForm(f=>({...f, location:e.target.value}))} />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Buyer'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Buyer List</div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 && <tr><td colSpan="5" className="text-center text-muted">No buyers</td></tr>}
                  {list.map(b => (
                    <tr key={b.id}>
                      <td>{b.name}</td>
                      <td>{b.phone || '-'}</td>
                      <td>{b.email || '-'}</td>
                      <td>{b.location || '-'}</td>
                      <td>{b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buyers;
