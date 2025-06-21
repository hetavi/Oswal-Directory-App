import React, { useEffect, useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../../firebase';
import localforage from 'localforage';

const SyncButton = () => {
  const [editedFamilies, setEditedFamilies] = useState({});
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const fetchEdited = async () => {
      const data = await localforage.getItem('editedFamilies');
      setEditedFamilies(data || {});
    };
    fetchEdited();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      for (const [familyId, familyData] of Object.entries(editedFamilies)) {
        await set(ref(db, `families/${familyId}`), {
          ...familyData,
          updatedAt: Date.now(),
        });
      }

      await localforage.removeItem('editedFamilies');
      await localforage.setItem('lastSynced', Date.now());
      setEditedFamilies({});
      alert('✔️ Changes synced to Firebase.');
    } catch (err) {
      console.error('Sync failed:', err);
      alert('❌ Failed to sync changes.');
    }
    setSyncing(false);
  };

  if (!Object.keys(editedFamilies).length) return null;

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className={`px-4 py-2 rounded font-semibold text-white ${
        syncing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      {syncing ? 'Syncing...' : 'Sync Changes'}
    </button>
  );
};

export default SyncButton;
