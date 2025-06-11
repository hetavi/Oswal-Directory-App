import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { role } = useAuth();

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4 text-center md:text-left">
        Dashboard
      </h1>

      <div className="bg-gray-100 p-4 md:p-6 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-center md:text-left">
          News & Announcements
        </h2>
        <ul className="list-disc list-inside text-sm md:text-base">
          <li>Family Meet on 15th July</li>
          <li>New Member Approvals Open</li>
          <li>Annual Picnic Registration starts next week</li>
        </ul>
      </div>

      <div className="mt-6 text-center md:text-left">
        <p className="text-gray-600 text-sm md:text-base">
          You are logged in as <span className="font-semibold capitalize">{role}</span>.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
