import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Procurement = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [produce, setProduce] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const allowedProduce = [
    'beans',
    'grain maize',
    'cowpeas',
    'groundnuts',
    'rice',
    'soybeans',
  ];
  const allowedSources = [
    { value: 'individual', label: 'Individual Dealer' },
    { value: 'company', label: 'Company' },
    { value: 'maganjo', label: 'Maganjo Farm' },
    { value: 'matugga', label: 'Matugga Farm' },
  ];
  const [form, setForm] = useState({
    branch_id: '',
    produce_id: '',
    source: '',
    dealer_name: '',
    dealer_phone: '',
    tonnage: '',
    cost_per_ton: '',
    selling_price_per_ton: '',
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
      const res = await api.get('/procurement', { params: branchId ? { branch_id: branchId } : {} });
      setList(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load procurements');
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
    // Enforce allowed produce types (frontend)
    const selectedProduce = produce.find(p => String(p.id) === String(form.produce_id));
    if (!selectedProduce || !allowedProduce.includes(selectedProduce.name)) {
      setError('Produce type not allowed');
      return;
    }
    // Enforce minimum 1 ton
    if (parseFloat(form.tonnage) < 1) {
      setError('Minimum procurement is 1 ton');
      return;
    }
    // Enforce allowed sources
    if (!form.source || !allowedSources.some(s => s.value === form.source)) {
      setError('Select a valid source');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const payload = {
        branch_id: Number(form.branch_id),
        produce_id: Number(form.produce_id),
        dealer_name: form.source, // send source as dealer_name for backend check
        dealer_phone: form.dealer_phone || undefined,
        tonnage: Number(form.tonnage),
        cost_per_ton: Number(form.cost_per_ton),
        selling_price_per_ton: Number(form.selling_price_per_ton),
      };
      await api.post('/procurement', payload);
      setForm({ ...form, tonnage: '', cost_per_ton: '', selling_price_per_ton: '' });
      await loadList(form.branch_id);
      alert('Procurement recorded');
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to record procurement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex align-items-center mb-3">
          <h1 className="h3 mb-0 me-3">Procurement</h1>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>loadList(form.branch_id)} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card mb-4">
          <div className="card-header">Record Procurement</div>
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
                    {produce.filter(p => allowedProduce.includes(p.name)).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Tonnage</label>
                  <input type="number" step="0.01" className="form-control" value={form.tonnage} onChange={(e)=>setForm(f=>({...f, tonnage:e.target.value}))} required />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Cost per Ton (UGX)</label>
                  <input type="number" step="0.01" className="form-control" value={form.cost_per_ton} onChange={(e)=>setForm(f=>({...f, cost_per_ton:e.target.value}))} required />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Selling Price per Ton (UGX)</label>
                  <input type="number" step="0.01" className="form-control" value={form.selling_price_per_ton} onChange={(e)=>setForm(f=>({...f, selling_price_per_ton:e.target.value}))} required />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Source</label>
                  <select className="form-select" value={form.source} onChange={e=>setForm(f=>({...f, source:e.target.value}))} required>
                    <option value="">Select source</option>
                    {allowedSources.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Dealer Phone</label>
                  <input className="form-control" value={form.dealer_phone} onChange={(e)=>setForm(f=>({...f, dealer_phone:e.target.value}))} />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Procurement'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Recent Procurements</div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Branch</th>
                    <th>Produce</th>
                    <th>Tonnage</th>
                    <th>Cost/Ton</th>
                    <th>Selling/Ton</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 && (
                    <tr><td colSpan="7" className="text-center text-muted">No procurements yet</td></tr>
                  )}
                  {list.map(r => (
                    <tr key={r.id}>
                      <td>{r.procurement_date}</td>
                      <td>{branches.find(b => String(b.id) === String(r.branch_id))?.name || r.branch_id}</td>
                      <td>{r.produce_name}</td>
                      <td>{r.tonnage}</td>
                      <td>{Number(r.cost_per_ton).toLocaleString()}</td>
                      <td>{Number(r.selling_price_per_ton).toLocaleString()}</td>
                      <td>{Number(r.total_cost).toLocaleString()}</td>
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

export default Procurement;
