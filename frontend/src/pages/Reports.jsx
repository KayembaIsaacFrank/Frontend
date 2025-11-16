import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Reports = () => {
  const [downloading, setDownloading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filters, setFilters] = useState({ branch_id: '', agent_id: '', from_date: '', to_date: '' });

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const br = await api.get('/branches');
        const b = br.data || [];
        setBranches(b);
      } catch {}
    };
    loadBranches();
  }, []);

  const loadAgentsForBranch = async (branchId) => {
    if (!branchId) { setAgents([]); return; }
    try {
      const res = await api.get(`/users/agents/branch/${branchId}`);
      setAgents(res.data || []);
    } catch {
      setAgents([]);
    }
  };

  const downloadFile = async (type) => {
    try {
      setDownloading(true);
      const endpoint = type === 'csv' ? '/reports/sales/csv' : type === 'xlsx' ? '/reports/sales/xlsx' : '/reports/sales/pdf';
      const params = {};
      if (filters.branch_id) params.branch_id = filters.branch_id;
      if (filters.agent_id) params.agent_id = filters.agent_id;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      const res = await api.get(endpoint, { responseType: 'blob', params });
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'csv' ? 'sales_report.csv' : type === 'xlsx' ? 'sales_report.xlsx' : 'sales_report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e?.response?.data?.error || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <h1 className="h3 mb-3">Reports & Export</h1>

        <div className="card mb-3">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <label className="form-label">Branch</label>
                <select className="form-select" value={filters.branch_id} onChange={(e)=>{ const v = e.target.value; setFilters(f=>({...f, branch_id:v, agent_id:''})); loadAgentsForBranch(v); }}>
                  <option value="">All branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">Agent</label>
                <select className="form-select" value={filters.agent_id} onChange={(e)=>setFilters(f=>({...f, agent_id:e.target.value}))} disabled={!filters.branch_id || agents.length===0}>
                  <option value="">All agents</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">From Date</label>
                <input type="date" className="form-control" value={filters.from_date} onChange={(e)=>setFilters(f=>({...f, from_date:e.target.value}))} />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">To Date</label>
                <input type="date" className="form-control" value={filters.to_date} onChange={(e)=>setFilters(f=>({...f, to_date:e.target.value}))} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body d-flex flex-wrap gap-2">
            <button className="btn btn-outline-primary" onClick={() => downloadFile('csv')} disabled={downloading}>Download Sales CSV</button>
            <button className="btn btn-primary" onClick={() => downloadFile('xlsx')} disabled={downloading}>Download Sales Excel</button>
            <button className="btn btn-danger" onClick={() => downloadFile('pdf')} disabled={downloading}>Download Sales PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
