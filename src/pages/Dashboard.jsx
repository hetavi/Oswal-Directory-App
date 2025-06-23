import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import LocalForageViewer from '../components/families/LocalForageViewer';

const Dashboard = () => {
  const { role } = useAuth();
  const [showStorage, setShowStorage] = useState(false);

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4 text-center md:text-left">
        Dashboard
      </h1>

      <div className="bg-gray-100 p-4 md:p-6 rounded shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2 text-center md:text-left">
          News & Announcements
        </h2>
        <ul className="list-disc list-inside text-sm md:text-base">
          <li>Loading spinner not working</li>
          <li>Use localforage for profile and families list</li>
          <li>Data add/edit - more details</li>
          <li>Edit button for own family only</li>
          <li>Birth date simple entry</li>
          <li>Back or cancel button on entry editing page</li>
        </ul>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowStorage(!showStorage)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showStorage ? 'Hide' : 'Show'} Local Storage
        </button>
      </div>

      {showStorage && <LocalForageViewer />}

      <div className="text-center md:text-left">
        <p className="text-gray-600 text-sm md:text-base">
          You are logged in as <span className="font-semibold capitalize">{role}</span>.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
