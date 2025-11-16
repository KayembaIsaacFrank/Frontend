import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const Analytics = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilters, setDateFilters] = useState({ from_date: '', to_date: '' });
  const [trend, setTrend] = useState([]);
  const [produceBreakdown, setProduceBreakdown] = useState([]);
  const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#7c3aed', '#0d9488'];

  const loadBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data || []);
      // If Manager/Sales Agent, default to own branch
      if (res.data && res.data.length === 1) {
        setBranchId(String(res.data[0].id));
      }
    } catch (e) {
      // ignore silently in UI, still can fetch KPIs
    }
  };

  const loadKpis = async (selectedBranchId = '') => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedBranchId) params.branch_id = selectedBranchId;
      if (dateFilters.from_date) params.from_date = dateFilters.from_date;
      if (dateFilters.to_date) params.to_date = dateFilters.to_date;
      const res = await api.get('/analytics', { params });
      setKpis(res.data?.kpis || null);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadTrend = async (selectedBranchId='') => {
    try {
      const params = { days: 30 };
      if (selectedBranchId) params.branch_id = selectedBranchId;
      if (dateFilters.from_date) params.from_date = dateFilters.from_date;
      if (dateFilters.to_date) params.to_date = dateFilters.to_date;
      const res = await api.get('/analytics/sales-trend', { params });
      setTrend(res.data?.trend || []);
    } catch {}
  };

  const loadProduceBreakdown = async (selectedBranchId='') => {
    try {
      const params = {};
      if (selectedBranchId) params.branch_id = selectedBranchId;
      if (dateFilters.from_date) params.from_date = dateFilters.from_date;
      if (dateFilters.to_date) params.to_date = dateFilters.to_date;
      const res = await api.get('/analytics/produce-breakdown', { params });
      setProduceBreakdown(res.data?.produce_breakdown || []);
    } catch {}
  };

  useEffect(() => {
    loadBranches();
    loadKpis();
    loadTrend();
    loadProduceBreakdown();
  }, []);

  const onBranchChange = (e) => {
    const val = e.target.value;
    setBranchId(val);
    loadKpis(val);
    loadTrend(val);
    loadProduceBreakdown(val);
  };

  const applyFilters = () => {
    loadKpis(branchId);
    loadTrend(branchId);
    loadProduceBreakdown(branchId);
  };

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
          <h1 className="h3 mb-0">Analytics & Dashboards</h1>
          <div className="d-flex flex-wrap gap-2">
            {user?.role === 'CEO' && (
              <select className="form-select form-select-sm" style={{ minWidth: 200 }} value={branchId} onChange={onBranchChange}>
                <option value="">All Branches</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <input type="date" className="form-control form-control-sm" value={dateFilters.from_date} onChange={(e)=>setDateFilters(f=>({...f, from_date:e.target.value}))} />
            <input type="date" className="form-control form-control-sm" value={dateFilters.to_date} onChange={(e)=>setDateFilters(f=>({...f, to_date:e.target.value}))} />
            <button className="btn btn-outline-secondary btn-sm" onClick={applyFilters} disabled={loading}>{loading ? 'Applying…' : 'Apply'}</button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {kpis && (
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card text-bg-light">
                <div className="card-body">
                  <div className="small text-uppercase text-muted">Total Sales</div>
                  <div className="fs-4">UGX {Number(kpis.total_sales).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card text-bg-light">
                <div className="card-body">
                  <div className="small text-uppercase text-muted">Total Tonnage Sold</div>
                  <div className="fs-4">{Number(kpis.total_tonnage).toLocaleString()} tons</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card text-bg-light">
                <div className="card-body">
                  <div className="small text-uppercase text-muted">Procurement Cost</div>
                  <div className="fs-4">UGX {Number(kpis.total_procurement_cost).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card text-bg-light">
                <div className="card-body">
                  <div className="small text-uppercase text-muted">Estimated Profit</div>
                  <div className="fs-4">UGX {Number(kpis.estimated_profit).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(trend.length > 0 || produceBreakdown.length > 0) && (
          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="card h-100">
                <div className="card-header">Sales Trend (Daily)</div>
                <div className="card-body" style={{height:320}}>
                  {trend.length === 0 && <div className="text-muted small">No trend data</div>}
                  {trend.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend}>
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
            <div className="col-12 col-lg-5">
              <div className="card h-100">
                <div className="card-header">Produce Breakdown</div>
                <div className="card-body" style={{height:320}}>
                  {produceBreakdown.length === 0 && <div className="text-muted small">No produce data</div>}
                  {produceBreakdown.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={produceBreakdown.slice(0,8)}>
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
                  {produceBreakdown.length === 0 && <div className="text-muted small">No data</div>}
                  {produceBreakdown.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={produceBreakdown} dataKey="total_sales" nameKey="produce_name" outerRadius={110} label={(d)=>d.produce_name}>
                          {produceBreakdown.map((entry, idx) => (
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
          </div>
        )}

        {!kpis && !loading && (
          <div className="alert alert-info mt-3">No KPI data yet.</div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
