// Spectate page
import React from 'react';
import { useParams } from 'react-router-dom';

const Spectate = () => {
  const { roomId } = useParams();

  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold mb-4">👁️ Spectator Mode</h1>
      <p className="text-gray-400">Watching match: {roomId}</p>
      <div className="mt-8 card">
        <p className="text-gray-500">Spectator view coming soon...</p>
      </div>
    </div>
  );
};

export default Spectate;