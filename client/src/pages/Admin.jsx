// Admin page
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🛠️ Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-medium mb-2">👥 Players</h3>
          <p className="text-2xl font-bold text-primary-400">0</p>
        </div>
        <div className="card">
          <h3 className="font-medium mb-2">🏆 Matches</h3>
          <p className="text-2xl font-bold text-primary-400">0</p>
        </div>
        <div className="card">
          <h3 className="font-medium mb-2">📊 Active</h3>
          <p className="text-2xl font-bold text-primary-400">0</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;