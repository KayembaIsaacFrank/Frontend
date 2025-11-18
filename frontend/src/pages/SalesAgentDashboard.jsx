/**
 * Sales Agent Dashboard Component
 * 
 * Purpose: All-in-one dashboard for sales agents with tabbed interface
 * - Combines procurement, sales, credit sales, and stock viewing
 * - Tab-based navigation for different functions
 * - Auto-filtered to agent's assigned branch
 * 
 * Tabs:
 * 1. Overview: Quick stats and recent activity summary
 * 2. Procurement: Record new stock purchases
 * 3. Sales: Record regular sales transactions
 * 4. Credit Sales: Record credit sales with buyer tracking
 * 5. Stock: View current inventory levels
 * 
 * Features:
 * - Overview Tab:
 *   - Quick stats cards (stock items, recent sales count, etc.)
 *   - Recent sales table
 *   - Recent procurements table
 *   - Recent credit sales table
 * 
 * - Procurement Tab:
 *   - Form to record procurement (produce, tonnage, prices, source)
 *   - Allowed produce types and sources enforced
 *   - Minimum 1 ton validation
 *   - List of agent's procurements
 * 
 * - Sales Tab:
 *   - Form to record sale (produce, buyer, tonnage, price, payment status)
 *   - Payment status: Paid or Credit
 *   - List of agent's sales
 * 
 * - Credit Sales Tab:
 *   - Form to record credit sale (produce, buyer details, due date)
 *   - Optional buyer selection from existing buyers
 *   - List of agent's credit sales
 * 
 * - Stock Tab:
 *   - Read-only view of current stock levels
 *   - Shows branch's inventory
 * 
 * Business Rules:
 * - All operations auto-scoped to agent's branch (user.branch_id)
 * - Procurement: only allowed produce types, minimum 1 ton
 * - Sales: validates stock availability
 * - Credit Sales: requires due date
 * 
 * Data Flow:
 * 1. Load branches, produce, buyers on mount
 * 2. Load branch-specific data (stock, sales, procurements, credit sales)
 * 3. On form submit: POST to respective endpoint with branch_id = user.branch_id
 * 4. Reload relevant data after successful submission
 * 5. Tab switching shows different views without reload
 */

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SalesAgentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [branches, setBranches] = useState([]);
  const [produce, setProduce] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [stock, setStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [recentProcurements, setRecentProcurements] = useState([]);
  const [recentCreditSales, setRecentCreditSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get user's branch
  const userBranchId = user?.branch_id;
  const userBranchName = branches.find(b => b.id === userBranchId)?.name || 'Your Branch';

  // Allowed produce types for procurement
  const allowedProduce = ['beans', 'grain maize', 'cowpeas', 'groundnuts', 'rice', 'soybeans'];
  const allowedSources = [
    { value: 'individual', label: 'Individual Dealer' },
    { value: 'company', label: 'Company' },
    { value: 'maganjo', label: 'Maganjo Farm' },
    { value: 'matugga', label: 'Matugga Farm' },
  ];

  // Form states
  const [procurementForm, setProcurementForm] = useState({
    produce_id: '',
    source: '',
    dealer_phone: '',
    tonnage: '',
    cost_per_ton: '',
    selling_price_per_ton: '',
  });

  const [salesForm, setSalesForm] = useState({
    produce_id: '',
    buyer_name: '',
    buyer_phone: '',
    tonnage: '',
    price_per_ton: '',
    payment_status: 'Paid',
  });

  const [creditSalesForm, setCreditSalesForm] = useState({
    produce_id: '',
    buyer_id: '',
    buyer_phone: '',
    buyer_location: '',
    national_id: '',
    tonnage: '',
    price_per_ton: '',
    due_date: '',
  });

  // Load all necessary data
  const loadData = async () => {
    try {
      const [branchesRes, produceRes, buyersRes] = await Promise.all([
        api.get('/branches'),
        api.get('/produce'),
        api.get('/buyers'),
      ]);
      setBranches(branchesRes.data || []);
      setProduce(produceRes.data || []);
      setBuyers(buyersRes.data?.data || []);

      if (userBranchId) {
        // Load branch-specific data
        const [stockRes, salesRes, procurementRes, creditRes] = await Promise.all([
          api.get('/stock', { params: { branch_id: userBranchId } }),
          api.get('/sales', { params: { branch_id: userBranchId } }),
          api.get('/procurement', { params: { branch_id: userBranchId } }),
          api.get('/credit-sales', { params: { branch_id: userBranchId } }),
        ]);
        setStock(stockRes.data?.data || []);
        setRecentSales((salesRes.data?.data || []).slice(0, 10));
        setRecentProcurements((procurementRes.data?.data || []).slice(0, 10));
        setRecentCreditSales((creditRes.data?.data || []).slice(0, 10));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [userBranchId]);

  // Submit procurement
  const submitProcurement = async (e) => {
    e.preventDefault();
    const selectedProduce = produce.find(p => String(p.id) === String(procurementForm.produce_id));
    if (!selectedProduce || !allowedProduce.includes(selectedProduce.name)) {
      setError('Produce type not allowed');
      return;
    }
    if (parseFloat(procurementForm.tonnage) < 1) {
      setError('Minimum procurement is 1 ton');
      return;
    }
    if (!allowedSources.some(s => s.value === procurementForm.source)) {
      setError('Select a valid source');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const payload = {
        branch_id: userBranchId,
        produce_id: Number(procurementForm.produce_id),
        dealer_name: procurementForm.source,
        dealer_phone: procurementForm.dealer_phone || undefined,
        tonnage: Number(procurementForm.tonnage),
        cost_per_ton: Number(procurementForm.cost_per_ton),
        selling_price_per_ton: Number(procurementForm.selling_price_per_ton),
      };
      await api.post('/procurement', payload);
      setProcurementForm({ produce_id: '', source: '', dealer_phone: '', tonnage: '', cost_per_ton: '', selling_price_per_ton: '' });
      setSuccess('Procurement recorded successfully!');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to record procurement');
    } finally {
      setLoading(false);
    }
  };

  // Submit sale
  const submitSale = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const payload = {
        branch_id: userBranchId,
        produce_id: Number(salesForm.produce_id),
        buyer_name: salesForm.buyer_name || undefined,
        buyer_phone: salesForm.buyer_phone || undefined,
        tonnage: Number(salesForm.tonnage),
        price_per_ton: Number(salesForm.price_per_ton),
        payment_status: salesForm.payment_status || 'Paid',
      };
      await api.post('/sales', payload);
      setSalesForm({ produce_id: '', buyer_name: '', buyer_phone: '', tonnage: '', price_per_ton: '', payment_status: 'Paid' });
      setSuccess('Sale recorded successfully!');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  // Submit credit sale
  const submitCreditSale = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const payload = {
        branch_id: userBranchId,
        produce_id: Number(creditSalesForm.produce_id),
        buyer_id: creditSalesForm.buyer_id ? Number(creditSalesForm.buyer_id) : undefined,
        buyer_phone: creditSalesForm.buyer_phone || undefined,
        buyer_location: creditSalesForm.buyer_location || undefined,
        national_id: creditSalesForm.national_id || undefined,
        tonnage: Number(creditSalesForm.tonnage),
        price_per_ton: Number(creditSalesForm.price_per_ton),
        due_date: creditSalesForm.due_date,
      };
      await api.post('/credit-sales', payload);
      setCreditSalesForm({ produce_id: '', buyer_id: '', buyer_phone: '', buyer_location: '', national_id: '', tonnage: '', price_per_ton: '', due_date: '' });
      setSuccess('Credit sale recorded successfully!');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
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
        <h2 className="mb-3">Sales Agent Dashboard - {userBranchName}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'procurement' ? 'active' : ''}`} onClick={() => setActiveTab('procurement')}>Procurement</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>Sales</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'credit' ? 'active' : ''}`} onClick={() => setActiveTab('credit')}>Credit Sales</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>Stock</button>
          </li>
        </ul>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card text-white bg-primary">
                  <div className="card-body">
                    <h6 className="card-title">Total Sales</h6>
                    <h3>{recentSales.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-white bg-success">
                  <div className="card-body">
                    <h6 className="card-title">Procurements</h6>
                    <h3>{recentProcurements.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-white bg-warning">
                  <div className="card-body">
                    <h6 className="card-title">Credit Sales</h6>
                    <h3>{recentCreditSales.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-white bg-info">
                  <div className="card-body">
                    <h6 className="card-title">Stock Items</h6>
                    <h3>{stock.length}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">Recent Sales</div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Produce</th>
                            <th>Tonnage</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentSales.length === 0 && <tr><td colSpan="4" className="text-center text-muted">No sales yet</td></tr>}
                          {recentSales.slice(0, 5).map(s => (
                            <tr key={s.id}>
                              <td>{s.sales_date}</td>
                              <td>{s.produce_name}</td>
                              <td>{s.tonnage}</td>
                              <td>{Number(s.total_amount).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">Current Stock</div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Produce</th>
                            <th>Tonnage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stock.length === 0 && <tr><td colSpan="2" className="text-center text-muted">No stock</td></tr>}
                          {stock.map(s => (
                            <tr key={s.id}>
                              <td>{s.produce_name}</td>
                              <td>{Number(s.current_tonnage ?? s.quantity ?? 0).toLocaleString()}</td>
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
        )}

        {/* Procurement Tab */}
        {activeTab === 'procurement' && (
          <div>
            <div className="card mb-4">
              <div className="card-header">Record Procurement</div>
              <div className="card-body">
                <form onSubmit={submitProcurement}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Produce</label>
                      <select className="form-select" value={procurementForm.produce_id} onChange={(e)=>setProcurementForm(f=>({...f, produce_id:e.target.value}))} required>
                        <option value="">Select produce</option>
                        {produce.filter(p => allowedProduce.includes(p.name)).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Source</label>
                      <select className="form-select" value={procurementForm.source} onChange={e=>setProcurementForm(f=>({...f, source:e.target.value}))} required>
                        <option value="">Select source</option>
                        {allowedSources.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Tonnage</label>
                      <input type="number" step="0.01" className="form-control" value={procurementForm.tonnage} onChange={(e)=>setProcurementForm(f=>({...f, tonnage:e.target.value}))} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Cost per Ton (UGX)</label>
                      <input type="number" step="0.01" className="form-control" value={procurementForm.cost_per_ton} onChange={(e)=>setProcurementForm(f=>({...f, cost_per_ton:e.target.value}))} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Selling Price per Ton (UGX)</label>
                      <input type="number" step="0.01" className="form-control" value={procurementForm.selling_price_per_ton} onChange={(e)=>setProcurementForm(f=>({...f, selling_price_per_ton:e.target.value}))} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Dealer Phone</label>
                      <input className="form-control" value={procurementForm.dealer_phone} onChange={(e)=>setProcurementForm(f=>({...f, dealer_phone:e.target.value}))} />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Procurement'}</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Recent Procurements</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={loadData} disabled={loading}>Refresh</button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Produce</th>
                        <th>Tonnage</th>
                        <th>Cost/Ton</th>
                        <th>Selling/Ton</th>
                        <th>Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProcurements.length === 0 && <tr><td colSpan="6" className="text-center text-muted">No procurements yet</td></tr>}
                      {recentProcurements.map(r => (
                        <tr key={r.id}>
                          <td>{r.procurement_date}</td>
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
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div>
            <div className="card mb-4">
              <div className="card-header">Record Sale</div>
              <div className="card-body">
                <form onSubmit={submitSale}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Produce</label>
                      <select className="form-select" value={salesForm.produce_id} onChange={(e)=>setSalesForm(f=>({...f, produce_id:e.target.value}))} required>
                        <option value="">Select produce</option>
                        {produce.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Tonnage</label>
                      <input type="number" step="0.01" className="form-control" value={salesForm.tonnage} onChange={(e)=>setSalesForm(f=>({...f, tonnage:e.target.value}))} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Price per Ton (UGX)</label>
                      <input type="number" step="0.01" className="form-control" value={salesForm.price_per_ton} onChange={(e)=>setSalesForm(f=>({...f, price_per_ton:e.target.value}))} required />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Payment</label>
                      <select className="form-select" value={salesForm.payment_status} onChange={(e)=>setSalesForm(f=>({...f, payment_status:e.target.value}))}>
                        <option value="Paid">Paid</option>
                        <option value="Credit">Credit</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Buyer Name</label>
                      <input className="form-control" value={salesForm.buyer_name} onChange={(e)=>setSalesForm(f=>({...f, buyer_name:e.target.value}))} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Buyer Phone</label>
                      <input className="form-control" value={salesForm.buyer_phone} onChange={(e)=>setSalesForm(f=>({...f, buyer_phone:e.target.value}))} />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Sale'}</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Recent Sales</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={loadData} disabled={loading}>Refresh</button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Produce</th>
                        <th>Tonnage</th>
                        <th>Price/Ton</th>
                        <th>Total Amount</th>
                        <th>Buyer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSales.length === 0 && <tr><td colSpan="6" className="text-center text-muted">No sales yet</td></tr>}
                      {recentSales.map(r => (
                        <tr key={r.id}>
                          <td>{r.sales_date}</td>
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
        )}

        {/* Credit Sales Tab */}
        {activeTab === 'credit' && (
          <div>
            <div className="card mb-4">
              <div className="card-header">Record Credit Sale</div>
              <div className="card-body">
                <form onSubmit={submitCreditSale}>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">Produce</label>
                      <select className="form-select" value={creditSalesForm.produce_id} onChange={(e)=>setCreditSalesForm(f=>({...f, produce_id:e.target.value}))} required>
                        <option value="">Select produce</option>
                        {produce.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Buyer (Optional)</label>
                      <select className="form-select" value={creditSalesForm.buyer_id} onChange={(e)=>setCreditSalesForm(f=>({...f, buyer_id:e.target.value}))}>
                        <option value="">Select buyer</option>
                        {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Tonnage</label>
                      <input type="number" step="0.01" className="form-control" value={creditSalesForm.tonnage} onChange={(e)=>setCreditSalesForm(f=>({...f, tonnage:e.target.value}))} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Price per Ton (UGX)</label>
                      <input type="number" step="0.01" className="form-control" value={creditSalesForm.price_per_ton} onChange={(e)=>setCreditSalesForm(f=>({...f, price_per_ton:e.target.value}))} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Due Date</label>
                      <input type="date" className="form-control" value={creditSalesForm.due_date} onChange={(e)=>setCreditSalesForm(f=>({...f, due_date:e.target.value}))} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Buyer Phone</label>
                      <input className="form-control" value={creditSalesForm.buyer_phone} onChange={(e)=>setCreditSalesForm(f=>({...f, buyer_phone:e.target.value}))} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Buyer Location</label>
                      <input className="form-control" value={creditSalesForm.buyer_location} onChange={(e)=>setCreditSalesForm(f=>({...f, buyer_location:e.target.value}))} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">National ID</label>
                      <input className="form-control" value={creditSalesForm.national_id} onChange={(e)=>setCreditSalesForm(f=>({...f, national_id:e.target.value}))} />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Credit Sale'}</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Recent Credit Sales</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={loadData} disabled={loading}>Refresh</button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Produce</th>
                        <th>Tonnage</th>
                        <th>Price/Ton</th>
                        <th>Total</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCreditSales.length === 0 && <tr><td colSpan="7" className="text-center text-muted">No credit sales</td></tr>}
                      {recentCreditSales.map(r => (
                        <tr key={r.id}>
                          <td>{r.sales_date}</td>
                          <td>{r.produce_name}</td>
                          <td>{r.tonnage}</td>
                          <td>{Number(r.price_per_ton).toLocaleString()}</td>
                          <td>{Number(r.total_amount).toLocaleString()}</td>
                          <td>{r.due_date}</td>
                          <td><span className={`badge bg-${r.status === 'Paid' ? 'success' : r.status === 'Pending' ? 'warning' : 'danger'}`}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <div>
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Current Stock - {userBranchName}</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={loadData} disabled={loading}>Refresh</button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Produce</th>
                        <th>Current Tonnage</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stock.length === 0 && <tr><td colSpan="3" className="text-center text-muted">No stock records</td></tr>}
                      {stock.map(r => (
                        <tr key={r.id}>
                          <td>{r.produce_name}</td>
                          <td>{Number(r.current_tonnage ?? r.quantity ?? 0).toLocaleString()}</td>
                          <td>{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesAgentDashboard;
