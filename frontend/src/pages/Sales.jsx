import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Sales = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [produce, setProduce] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    branch_id: '',
    produce_id: '',
    buyer_name: '',
    buyer_phone: '',
    tonnage: '',
    price_per_ton: '',
    payment_status: 'Paid',
  });

  const loadBasics = async () => {
    try {
      const [br, pr] = await Promise.all([
        api.get('/branches'),
        api.get('/produce'),
      ]);
      const b = br.data || [];
      setBranches(b);
      setProduce(pr.data || []);
      const defaultBranch = b.length === 1 ? String(b[0].id) : '';
      setForm(f => ({ ...f, branch_id: f.branch_id || defaultBranch }));
    } catch {}
  };

  const loadList = async (branchId) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/sales', { params: branchId ? { branch_id: branchId } : {} });
      setList(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBasics();
    loadList('');
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const payload = {
        branch_id: Number(form.branch_id),
        produce_id: Number(form.produce_id),
        buyer_name: form.buyer_name || undefined,
        buyer_phone: form.buyer_phone || undefined,
        tonnage: Number(form.tonnage),
        price_per_ton: Number(form.price_per_ton),
        payment_status: form.payment_status || 'Paid',
      };
      await api.post('/sales', payload);
      setForm({ ...form, tonnage: '', price_per_ton: '', buyer_name: '', buyer_phone: '' });
      await loadList(form.branch_id);
      alert('Sale recorded');
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex align-items-center mb-3">
          <h1 className="h3 mb-0 me-3">Sales</h1>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>loadList(form.branch_id)} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card mb-4">
          <div className="card-header">Record Sale</div>
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
                <div className="col-12 col-md-2">
                  <label className="form-label">Tonnage</label>
                  <input type="number" step="0.01" className="form-control" value={form.tonnage} onChange={(e)=>setForm(f=>({...f, tonnage:e.target.value}))} required />
                </div>
                <div className="col-12 col-md-2">
                  <label className="form-label">Price per Ton (UGX)</label>
                  <input type="number" step="0.01" className="form-control" value={form.price_per_ton} onChange={(e)=>setForm(f=>({...f, price_per_ton:e.target.value}))} required />
                </div>
                <div className="col-12 col-md-2">
                  <label className="form-label">Payment</label>
                  <select className="form-select" value={form.payment_status} onChange={(e)=>setForm(f=>({...f, payment_status:e.target.value}))}>
                    <option value="Paid">Paid</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Buyer Name</label>
                  <input className="form-control" value={form.buyer_name} onChange={(e)=>setForm(f=>({...f, buyer_name:e.target.value}))} />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Buyer Phone</label>
                  <input className="form-control" value={form.buyer_phone} onChange={(e)=>setForm(f=>({...f, buyer_phone:e.target.value}))} />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Sale'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Recent Sales</div>
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
                    <th>Total Amount</th>
                    <th>Buyer</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 && (
                    <tr><td colSpan="7" className="text-center text-muted">No sales yet</td></tr>
                  )}
                  {list.map(r => (
                    <tr key={r.id}>
                      <td>{r.sales_date}</td>
                      <td>{branches.find(b => String(b.id) === String(r.branch_id))?.name || r.branch_id}</td>
                      <td>{r.produce_name}</td>
                      <td>{r.tonnage}</td>
                      <td>{Number(r.price_per_ton).toLocaleString()}</td>
                      <td>{Number(r.total_amount).toLocaleString()}</td>
                      <td>{r.buyer_name || '-'}</td>
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

export default Sales;
