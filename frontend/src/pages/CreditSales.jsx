import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const CreditSales = () => {
  const [branches, setBranches] = useState([]);
  const [produce, setProduce] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ branch_id: '', status: '' });
  const [form, setForm] = useState({
    branch_id: '',
    produce_id: '',
    buyer_id: '',
    buyer_phone: '',
    buyer_location: '',
    national_id: '',
    tonnage: '',
    price_per_ton: '',
    due_date: '',
  });

  const loadBasics = async () => {
    try {
      const [br, pr, by] = await Promise.all([
        api.get('/branches'),
        api.get('/produce'),
        api.get('/buyers'),
      ]);
      setBranches(br.data || []);
      setProduce(pr.data || []);
      setBuyers(by.data?.data || []);
    } catch {}
  };

  const loadList = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.branch_id) params.branch_id = filters.branch_id;
      if (filters.status) params.status = filters.status;
      const res = await api.get('/credit-sales', { params });
      setList(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load credit sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBasics();
    loadList();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const payload = {
        branch_id: Number(form.branch_id),
        produce_id: Number(form.produce_id),
        buyer_id: form.buyer_id ? Number(form.buyer_id) : undefined,
        buyer_phone: form.buyer_phone || undefined,
        buyer_location: form.buyer_location || undefined,
        national_id: form.national_id || undefined,
        tonnage: Number(form.tonnage),
        price_per_ton: Number(form.price_per_ton),
        due_date: form.due_date,
      };
      await api.post('/credit-sales', payload);
      setForm({ ...form, tonnage: '', price_per_ton: '', due_date: '' });
      await loadList();
      alert('Credit sale recorded');
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to record credit sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex align-items-center mb-3">
          <h1 className="h3 mb-0 me-3">Credit Sales</h1>
          <button className="btn btn-outline-secondary btn-sm" onClick={loadList} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card mb-4">
          <div className="card-header">Record Credit Sale</div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <label className="form-label">Branch</label>
                  <select className="form-select" value={form.branch_id} onChange={(e)=>setForm(f=>({...f, branch_id:e.target.value}))} required>
                    <option value="">Select branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Produce</label>
                  <select className="form-select" value={form.produce_id} onChange={(e)=>setForm(f=>({...f, produce_id:e.target.value}))} required>
                    <option value="">Select produce</option>
                    {produce.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Buyer</label>
                  <select className="form-select" value={form.buyer_id} onChange={(e)=>setForm(f=>({...f, buyer_id:e.target.value}))}>
                    <option value="">Optional</option>
                    {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Tonnage</label>
                  <input type="number" step="0.01" className="form-control" value={form.tonnage} onChange={(e)=>setForm(f=>({...f, tonnage:e.target.value}))} required />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Price per Ton (UGX)</label>
                  <input type="number" step="0.01" className="form-control" value={form.price_per_ton} onChange={(e)=>setForm(f=>({...f, price_per_ton:e.target.value}))} required />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-control" value={form.due_date} onChange={(e)=>setForm(f=>({...f, due_date:e.target.value}))} required />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Buyer Phone</label>
                  <input className="form-control" value={form.buyer_phone} onChange={(e)=>setForm(f=>({...f, buyer_phone:e.target.value}))} />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Buyer Location</label>
                  <input className="form-control" value={form.buyer_location} onChange={(e)=>setForm(f=>({...f, buyer_location:e.target.value}))} />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">National ID</label>
                  <input className="form-control" value={form.national_id} onChange={(e)=>setForm(f=>({...f, national_id:e.target.value}))} />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Credit Sale'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex flex-wrap align-items-center gap-2">
            <span>Credit Sales List</span>
            <select className="form-select form-select-sm" style={{width:160}} value={filters.branch_id} onChange={(e)=>setFilters(f=>({...f, branch_id:e.target.value}))}>
              <option value="">All branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="form-select form-select-sm" style={{width:140}} value={filters.status} onChange={(e)=>setFilters(f=>({...f, status:e.target.value}))}>
              <option value="">All status</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button className="btn btn-outline-secondary btn-sm" onClick={loadList} disabled={loading}>Apply</button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Branch</th>
                    <th>Produce</th>
                    <th>Tonnage</th>
                    <th>Price/Ton</th>
                    <th>Total</th>
                    <th>Due</th>
                    <th>Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 && <tr><td colSpan="9" className="text-center text-muted">No credit sales</td></tr>}
                  {list.map(r => (
                    <tr key={r.id}>
                      <td>{r.sales_date}</td>
                      <td>{r.branch_name}</td>
                      <td>{r.produce_name}</td>
                      <td>{r.tonnage}</td>
                      <td>{Number(r.price_per_ton).toLocaleString()}</td>
                      <td>{Number(r.total_amount).toLocaleString()}</td>
                      <td>{Number(r.amount_due).toLocaleString()}</td>
                      <td>{Number(r.amount_paid).toLocaleString()}</td>
                      <td>{r.status}</td>
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

export default CreditSales;
