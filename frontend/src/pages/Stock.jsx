/**
 * Stock Page Component
 * 
 * Purpose: View current inventory levels across all branches
 * - Read-only display of stock quantities
 * - Filter by branch or view all branches
 * - Shows current tonnage and last update timestamp
 * 
 * Features:
 * - Table showing all stock records
 * - Branch filter dropdown
 * - Refresh button to reload data
 * - Displays: branch name, produce type, current tonnage, last updated
 * 
 * Data Flow:
 * 1. Load branches on mount
 * 2. GET /stock endpoint (with optional branch_id filter)
 * 3. Display stock records in table
 * 4. Stock levels auto-updated by procurement and sales transactions
 *
 * Note: This is view-only - stock is modified through Procurement and Sales pages
 */

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Stock = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [branchId, setBranchId] = useState('');

  const loadBranches = async () => {
    try {
      const br = await api.get('/branches');
      const b = br.data || [];
      setBranches(b);
      const defaultBranch = b.length === 1 ? String(b[0].id) : '';
      setBranchId(prev => prev || defaultBranch);
    } catch {}
  };

  const loadList = async (id) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/stock', { params: id ? { branch_id: id } : {} });
      setList(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
    loadList('');
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex align-items-center mb-3">
          <h1 className="h3 mb-0 me-3">Stock</h1>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>loadList(branchId)} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
          <div className="ms-auto" style={{minWidth:220}}>
            <select className="form-select" value={branchId} onChange={(e)=>{ setBranchId(e.target.value); loadList(e.target.value); }}>
              <option value="">All branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card">
          <div className="card-header">Current Stock</div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Branch</th>
                    <th>Produce</th>
                    <th>Current Tonnage</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 && (
                    <tr><td colSpan="4" className="text-center text-muted">No stock records</td></tr>
                  )}
                  {list.map(r => (
                    <tr key={r.id}>
                      <td>{branches.find(b => String(b.id) === String(r.branch_id))?.name || r.branch_id}</td>
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
    </div>
  );
};

export default Stock;
