// components/LocalForageViewer.js
import React, { useEffect, useState } from 'react';
import localforage from 'localforage';

const LocalForageViewer = () => {
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
  );
};

export default LocalForageViewer;
