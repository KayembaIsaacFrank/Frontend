import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const ManagerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [creditSales, setCreditSales] = useState([]);
  const [approvalError, setApprovalError] = useState('');
  const [approvalSuccess, setApprovalSuccess] = useState('');

  useEffect(() => {
    api.get('/analytics/branch').then(res => setAnalytics(res.data)).catch(() => setAnalytics(null));
    api.get('/credit-sales?status=Pending').then(res => setCreditSales(res.data?.data || [])).catch(() => setCreditSales([]));
  }, []);

  const handleApprove = async (saleId) => {
    setApprovalError('');
    setApprovalSuccess('');
    try {
      await api.post(`/credit-sales/approve/${saleId}`);
      setApprovalSuccess('Credit sale approved.');
      setCreditSales(cs => cs.filter(s => s.id !== saleId));
    } catch (err) {
      setApprovalError(err?.response?.data?.error || 'Failed to approve credit sale');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Manager Dashboard</h2>
      <ul>
        <li>View branch analytics and KPIs</li>
        <li>Approve credit sales</li>
        <li>Generate and export reports</li>
      </ul>
      <div className="alert alert-info mt-4">Manager access is now limited to analytics, reporting, and credit sales approval. Procurement, sales, and agent management are handled by other roles.</div>

      <div className="mt-4">
        <h4>Branch Analytics</h4>
        {analytics ? (
          <pre className="bg-light p-3 rounded">{JSON.stringify(analytics, null, 2)}</pre>
        ) : (
          <div>Loading analytics…</div>
        )}
      </div>

      <div className="mt-4">
        <h4>Pending Credit Sales Approval</h4>
        {approvalError && <div className="alert alert-danger">{approvalError}</div>}
        {approvalSuccess && <div className="alert alert-success">{approvalSuccess}</div>}
        {creditSales.length === 0 ? (
          <div>No pending credit sales for approval.</div>
        ) : (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Agent</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {creditSales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{sale.agent_name || sale.agentName}</td>
                  <td>{sale.buyer_name || sale.buyerName}</td>
                  <td>{sale.amount || sale.total_amount}</td>
                  <td>{sale.sales_date || sale.date}</td>
                  <td>
                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(sale.id)}>
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
