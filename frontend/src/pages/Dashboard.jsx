import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [agentForm, setAgentForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [creating, setCreating] = useState(false);
  // CEO data
  const [overview, setOverview] = useState([]);
  const [topProduce, setTopProduce] = useState([]);
  const [loadingCeo, setLoadingCeo] = useState(false);
  const [dateFilters, setDateFilters] = useState({ from_date: '', to_date: '' });
  const [selectedBranch, setSelectedBranch] = useState('');
  // Manager data
  const [managerKpis, setManagerKpis] = useState(null);
  const [agentPerf, setAgentPerf] = useState([]);
  const [loadingManager, setLoadingManager] = useState(false);
  const [managerTrend, setManagerTrend] = useState([]);
  const [managerProduce, setManagerProduce] = useState([]);
  const [branchAgents, setBranchAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');

  const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#7c3aed', '#0d9488'];

  useEffect(() => {
    if (user?.role === 'Manager') {
      api.get('/branches').then(res => setBranches(res.data || [])).catch(()=>{});
      // Fetch agents for this manager's branch
      if (user.branch_id) {
        api.get(`/users/agents/branch/${user.branch_id}`)
          .then(res => setBranchAgents(res.data || []))
          .catch(() => setBranchAgents([]));
      }
      loadManagerData();
      loadManagerTrend();
      loadManagerProduce();
    } else if (user?.role === 'CEO') {
      api.get('/branches').then(res => setBranches(res.data || [])).catch(()=>{});
      loadCeoData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCeoData = async () => {
    try {
      setLoadingCeo(true);
      const params = {};
      if (dateFilters.from_date) params.from_date = dateFilters.from_date;
      if (dateFilters.to_date) params.to_date = dateFilters.to_date;
      if (selectedBranch) params.branch_id = selectedBranch;
      const [ovRes, tpRes] = await Promise.all([
        api.get('/analytics/branches-overview', { params }),
        api.get('/analytics/top-produce', { params: { ...params, limit: 5 } }),
      ]);
      setOverview(ovRes.data?.branches || []);
      setTopProduce(tpRes.data?.top_produce || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCeo(false);
    }
  };

  const loadManagerData = async () => {
    try {
      setLoadingManager(true);
      const params = {};
      if (dateFilters.from_date) params.from_date = dateFilters.from_date;
      if (dateFilters.to_date) params.to_date = dateFilters.to_date;
      const [kpisRes, perfRes] = await Promise.all([
        api.get('/analytics', { params }),
        api.get('/analytics/agents-performance', { params }),
      ]);
      setManagerKpis(kpisRes.data?.kpis || null);
      setAgentPerf(perfRes.data?.agents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingManager(false);
    }
  };

  const loadManagerTrend = async () => {
    try {
      const params = { days: 30 };
      if (dateFilters.from_date) params.from_date = dateFilters.from_date;
      if (dateFilters.to_date) params.to_date = dateFilters.to_date;
      const res = await api.get('/analytics/sales-trend', { params });
      setManagerTrend(res.data?.trend || []);
    } catch {}
  };

  const loadManagerProduce = async () => {
    try {
      const params = {};
      if (dateFilters.from_date) params.from_date = dateFilters.from_date;
      if (dateFilters.to_date) params.to_date = dateFilters.to_date;
      const res = await api.get('/analytics/produce-breakdown', { params });
      setManagerProduce(res.data?.produce_breakdown || []);
    } catch {}
  };

  const totalSalesAllBranches = overview.reduce((sum, b) => sum + Number(b.total_sales || 0), 0);
  const branchChartData = overview.map(b => ({ name: b.branch_name, sales: Number(b.total_sales || 0), profit: Number(b.estimated_profit || 0) }));
  const producePieData = topProduce.map((p, i) => ({ name: p.produce_name, value: Number(p.total_sales || 0), fill: COLORS[i % COLORS.length] }));

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        
        {user?.role === 'CEO' && (
          <div className="bg-white rounded-lg shadow p-4 p-md-5">
            <div className="d-flex align-items-center mb-3 flex-wrap gap-2">
              <h2 className="h4 mb-0">Company Overview</h2>
              <div className="ms-auto d-flex gap-2 align-items-center">
                <select className="form-select form-select-sm" style={{minWidth:160}} value={selectedBranch} onChange={e=>setSelectedBranch(e.target.value)}>
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <input type="date" className="form-control form-control-sm" value={dateFilters.from_date} onChange={(e)=>setDateFilters(f=>({...f, from_date:e.target.value}))} />
                <input type="date" className="form-control form-control-sm" value={dateFilters.to_date} onChange={(e)=>setDateFilters(f=>({...f, to_date:e.target.value}))} />
                <button className="btn btn-sm btn-outline-secondary" onClick={loadCeoData} disabled={loadingCeo}>{loadingCeo ? 'Loading…' : 'Apply'}</button>
              </div>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3">
                <div className="border rounded p-3 bg-light">
                  <div className="text-muted small">Branches</div>
                  <div className="fs-4 fw-semibold">{overview.length}</div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="border rounded p-3 bg-light">
                  <div className="text-muted small">Total Sales (UGX)</div>
                  <div className="fs-5 fw-semibold">{totalSalesAllBranches.toLocaleString()}</div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="border rounded p-3 bg-light">
                  <div className="text-muted small">Avg Profit</div>
                  <div className="fs-5 fw-semibold">{overview.length ? Math.round(overview.reduce((s,b)=>s+Number(b.estimated_profit||0),0)/overview.length).toLocaleString() : 0}</div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="border rounded p-3 bg-light">
                  <div className="text-muted small">Top Produce Count</div>
                  <div className="fs-4 fw-semibold">{topProduce.length}</div>
                </div>
              </div>
            </div>
            <div className="row g-4">
              <div className="col-12 col-lg-7">
                <div className="card h-100">
                  <div className="card-header">Branch Sales & Profit</div>
                  <div className="card-body" style={{height:320}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={branchChartData}>
                        <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip formatter={(v)=>v.toLocaleString()} />
                        <Legend />
                        <Bar dataKey="sales" name="Sales" fill="#2563eb" />
                        <Bar dataKey="profit" name="Profit" fill="#16a34a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-5">
                <div className="card h-100">
                  <div className="card-header">Top Produce (Sales UGX)</div>
                  <div className="card-body" style={{height:320}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={producePieData} dataKey="value" nameKey="name" outerRadius={110} label={(d)=>d.name}>
                          {producePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v)=>v.toLocaleString()} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {(user?.role === 'Manager' || user?.role === 'Sales Agent') && (
          <>
            {user?.role === 'Manager' && (
              <div className="bg-white rounded-lg shadow p-4 p-md-5">
                <h2 className="h4 mb-3">Welcome, Manager {user.full_name}</h2>
                <div className="row g-4">
                  <div className="col-12 col-lg-6">
                    <div className="card">
                      <div className="card-header">Create Sales Agent (one per branch)</div>
                      <div className="card-body">
                        <form onSubmit={async (e)=>{
                          e.preventDefault();
                          setCreating(true);
                          try {
                            const branch_id = branches[0]?.id || user.branch_id;
                            await api.post('/auth/create-agent', { ...agentForm, branch_id });
                            setAgentForm({ full_name: '', email: '', phone: '', password: '' });
                            alert('Agent created');
                            // Refresh agents list
                            if (user.branch_id) {
                              const res = await api.get(`/users/agents/branch/${user.branch_id}`);
                              setBranchAgents(res.data || []);
                            }
                          } catch (er) {
                            alert(er?.response?.data?.error || 'Failed to create agent');
                          } finally {
                            setCreating(false);
                          }
                        }}>
                          <div className="row g-3">
                            <div className="col-12 col-md-6">
                              <label className="form-label">Full Name</label>
                              <input className="form-control" value={agentForm.full_name} onChange={(e)=>setAgentForm(f=>({...f, full_name:e.target.value}))} required />
                            </div>
                            <div className="col-12 col-md-6">
                              <label className="form-label">Email</label>
                              <input type="email" className="form-control" value={agentForm.email} onChange={(e)=>setAgentForm(f=>({...f, email:e.target.value}))} required />
                            </div>
                            <div className="col-12 col-md-6">
                              <label className="form-label">Phone</label>
                              <input className="form-control" value={agentForm.phone} onChange={(e)=>setAgentForm(f=>({...f, phone:e.target.value}))} />
                            </div>
                            <div className="col-12 col-md-6">
                              <label className="form-label">Password</label>
                              <input type="password" className="form-control" value={agentForm.password} onChange={(e)=>setAgentForm(f=>({...f, password:e.target.value}))} required />
                            </div>
                            <div className="col-12">
                              <button className="btn btn-primary" type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create Agent'}</button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">Branch Sales Trend (30 days)</div>
                      <div className="card-body" style={{height:320}}>
                        {managerTrend.length === 0 && <div className="text-muted small">No trend data</div>}
                        {managerTrend.length > 0 && (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={managerTrend}>
                              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                              <YAxis />
                              <Tooltip formatter={(v)=>Number(v).toLocaleString()} />
                              <Line type="monotone" dataKey="total_sales" name="Sales (UGX)" stroke="#2563eb" strokeWidth={2} />
                              <Line type="monotone" dataKey="total_tonnage" name="Tonnage" stroke="#16a34a" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">Produce Breakdown</div>
                      <div className="card-body" style={{height:320}}>
                        {managerProduce.length === 0 && <div className="text-muted small">No produce data</div>}
                        {managerProduce.length > 0 && (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={managerProduce.slice(0,8)}>
                              <XAxis dataKey="produce_name" interval={0} tick={{ fontSize: 11 }} />
                              <YAxis />
                              <Tooltip formatter={(v)=>Number(v).toLocaleString()} />
                              <Bar dataKey="total_sales" name="Sales (UGX)" fill="#f59e0b" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">Produce Share (Sales)</div>
                      <div className="card-body" style={{height:300}}>
                        {managerProduce.length === 0 && <div className="text-muted small">No data</div>}
                        {managerProduce.length > 0 && (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={managerProduce} dataKey="total_sales" nameKey="produce_name" outerRadius={110} label={(d)=>d.produce_name}>
                                {managerProduce.map((entry, idx) => (
                                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v)=>Number(v).toLocaleString()} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card h-100">
                    <div className="card-header">Branch KPIs</div>
                    <div className="card-body">
                      {!managerKpis && <div className="text-muted small">Loading KPIs…</div>}
                      {managerKpis && (
                        <div className="row g-3">
                          <div className="col-6">
                            <div className="border rounded p-2 bg-light">
                              <div className="small text-muted">Sales (UGX)</div>
                              <div className="fw-semibold">{managerKpis.total_sales.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="border rounded p-2 bg-light">
                              <div className="small text-muted">Tonnage Sold</div>
                              <div className="fw-semibold">{managerKpis.total_tonnage}</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="border rounded p-2 bg-light">
                              <div className="small text-muted">Procurement Cost</div>
                              <div className="fw-semibold">{managerKpis.total_procurement_cost.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="border rounded p-2 bg-light">
                              <div className="small text-muted">Est. Profit</div>
                              <div className="fw-semibold">{managerKpis.estimated_profit.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-header d-flex align-items-center">
                        <span>Agent Performance</span>
                        <div className="ms-auto d-flex gap-2 align-items-center">
                          <select className="form-select form-select-sm" style={{minWidth:140}} value={selectedAgent} onChange={e=>setSelectedAgent(e.target.value)}>
                            <option value="">All Agents</option>
                            {branchAgents.map(a => (
                              <option key={a.id} value={a.id}>{a.full_name}</option>
                            ))}
                          </select>
                          <input type="date" className="form-control form-control-sm" value={dateFilters.from_date} onChange={(e)=>setDateFilters(f=>({...f, from_date:e.target.value}))} />
                          <input type="date" className="form-control form-control-sm" value={dateFilters.to_date} onChange={(e)=>setDateFilters(f=>({...f, to_date:e.target.value}))} />
                          <button className="btn btn-sm btn-outline-secondary" onClick={loadManagerData} disabled={loadingManager}>{loadingManager ? 'Loading…' : 'Apply'}</button>
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive" style={{maxHeight:300}}>
                          <table className="table table-sm table-striped mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Agent</th>
                                <th>Sales (UGX)</th>
                                <th>Tonnage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {agentPerf.filter(a => !selectedAgent || String(a.agent_id) === String(selectedAgent)).length === 0 && (
                                <tr><td colSpan="3" className="text-center text-muted small">No data</td></tr>
                              )}
                              {agentPerf.filter(a => !selectedAgent || String(a.agent_id) === String(selectedAgent)).map(a => (
                                <tr key={a.agent_id}>
                                  <td>{a.agent_name}</td>
                                  <td>{Number(a.total_sales).toLocaleString()}</td>
                                  <td>{a.total_tonnage}</td>
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
            {user?.role === 'Sales Agent' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold mb-4">Welcome, Agent {user.full_name}</h2>
                <p>Agent Dashboard - Record sales and manage inventory</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
