// Profile page
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DepartmentBadge } from '../components/common/DepartmentBadge';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center text-4xl">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <div className="flex items-center gap-2 mt-1">
              <DepartmentBadge department={user.department} />
              <span className="text-sm text-gray-400">ELO: {user.elo || 1200}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-400">{user.stats?.wins || 0}</div>
            <div className="text-xs text-gray-400">Wins</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{user.stats?.losses || 0}</div>
            <div className="text-xs text-gray-400">Losses</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{user.stats?.highestWPM || 0}</div>
            <div className="text-xs text-gray-400">Best WPM</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{user.stats?.bestAccuracy || 0}%</div>
            <div className="text-xs text-gray-400">Best Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;