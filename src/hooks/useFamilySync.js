// hooks/useFamilySync.js
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import localforage from 'localforage';
import { db } from '../firebase';

const FAMILY_KEY = 'localFamilies';
const SYNC_KEY = 'lastSynced';

const useFamilySync = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage
  useEffect(() => {
    const loadLocal = async () => {
      const localData = await localforage.getItem(FAMILY_KEY);
      setFamilies(localData || []);
      setLoading(false);
    };
    loadLocal();
  }, []);

  // Listen to new updates from Firebase
  useEffect(() => {
    const syncFromFirebase = async () => {
      const lastSynced = await localforage.getItem(SYNC_KEY) || 0;
      const familiesRef = ref(db, 'families');

      onValue(familiesRef, (snapshot) => {
        const allData = snapshot.val() || {};
        const newFamilies = Object.values(allData).filter(fam => fam.updatedAt > lastSynced);

        if (newFamilies.length > 0) {
          setFamilies((prev) => {
            const merged = [...prev];
            newFamilies.forEach((newFam) => {
              const idx = merged.findIndex(f => f.id === newFam.id);
              if (idx !== -1) {
                merged[idx] = newFam;
              } else {
                merged.push(newFam);
              }
            });

            localforage.setItem(FAMILY_KEY, merged);
            return merged;
          });

          localforage.setItem(SYNC_KEY, Date.now());
        }
      });
    };

    syncFromFirebase();
  }, []);

  return { families, setFamilies, loading };
};

export default useFamilySync;
