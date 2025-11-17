import React from 'react';
import CreateAgentForm from '../components/CreateAgentForm';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="container py-4">
      <h2 className="mb-3">Manager Dashboard</h2>
      <ul>
        <li>View branch analytics and KPIs</li>
        <li>Manage procurement and sales</li>
        <li>View and manage agents</li>
        <li>View branch stock</li>
        <li>Generate and export reports</li>
      </ul>
      <div className="row mt-4">
        <div className="col-12 col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header">Add Sales Agent</div>
            <div className="card-body">
              {user?.branch_id && <CreateAgentForm branchId={user.branch_id} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
