import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import localforage from 'localforage';

const Dashboard = () => {
  const { role } = useAuth();
  const [localData, setLocalData] = useState([]);

  useEffect(() => {
    const loadLocalData = async () => {
      const allData = [];
      const keys = await localforage.keys();

      for (const key of keys) {
        try {
          const value = await localforage.getItem(key);
          allData.push({ key, value });
        } catch (err) {
          console.error(`Failed to load ${key}:`, err);
        }
      }

      setLocalData(allData);
    };

    loadLocalData();
  }, []);

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

      <div className="bg-white p-4 rounded shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-2">LocalForage Contents</h2>
        {localData.length === 0 ? (
          <p className="text-sm text-gray-500">No data found in localforage.</p>
        ) : (
          <ul className="text-sm space-y-2 overflow-auto max-h-[400px]">
            {localData.map(({ key, value }) => (
              <li key={key} className="border p-2 rounded bg-gray-50">
                <strong className="text-blue-600">{key}:</strong>
                <pre className="whitespace-pre-wrap text-xs text-gray-700">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center md:text-left">
        <p className="text-gray-600 text-sm md:text-base">
          You are logged in as <span className="font-semibold capitalize">{role}</span>.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
