/**
 * Dashboard Page Component
 * 
 * Purpose: Role-based dashboard showing different views for CEO, Manager, and Sales Agent
 * - CEO: Company-wide analytics, branch performance, top produce charts
 * - Manager: Branch KPIs, sales agent performance, team management
 * - Sales Agent: Welcome message with quick links
 * 
 * Features:
 * - CEO Dashboard:
 *   - Branch overview with sales and profit metrics
 *   - Date range and branch filtering
 *   - Bar chart: Branch sales vs profit comparison
 *   - Pie chart: Top 5 produce by sales
 *   - KPI cards: Total branches, sales, profit, top produce
 * 
 * - Manager Dashboard:
 *   - Sales agents list for their branch
 *   - Branch KPIs (sales, tonnage, cost, profit)
 *   - Agent performance comparison table
 *   - Sales trend line chart (30-day)
 *   - Produce breakdown by type
 * 
 * Data Flow:
 * 1. Detects user role from AuthContext
 * 2. Fetches role-specific analytics from backend
 * 3. Renders appropriate charts and tables
 * 4. Supports filtering by date range and branch (CEO)
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();  // Get current logged-in user
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
                    <div className="card h-100">
                      <div className="card-header">Your Sales Agents</div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-sm table-striped mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {branchAgents.length === 0 && (
                                <tr>
                                  <td colSpan="4" className="text-center text-muted">No sales agents yet</td>
                                </tr>
                              )}
                              {branchAgents.map((a, idx) => (
                                <tr key={a.id}>
                                  <td>{idx + 1}</td>
                                  <td>{a.full_name}</td>
                                  <td>{a.email}</td>
                                  <td>{a.phone}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
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
                  </div>
                  <div className="col-12">
                    <div className="card h-100 mt-4">
                      <div className="card-header">Sales Agent Performance</div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-sm table-striped mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Agent</th>
                                <th>Sales (UGX)</th>
                                <th>Tonnage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {agentPerf.length === 0 && (
                                <tr><td colSpan="3" className="text-center text-muted small">No data</td></tr>
                              )}
                              {agentPerf.map(a => (
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
