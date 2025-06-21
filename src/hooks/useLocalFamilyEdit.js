import { useEffect, useState } from 'react';
import localforage from 'localforage';

const KEY = 'localFamilyEdits';

export const useLocalFamilyEdit = (familyId) => {
  const [localData, setLocalData] = useState(null);

  useEffect(() => {
    const fetchLocal = async () => {
      const data = await localforage.getItem(KEY);
      if (data?.[familyId]) {
        setLocalData(data[familyId]);
      }
    };
    fetchLocal();
  }, [familyId]);

  const saveLocalEdit = async (data) => {
    const current = (await localforage.getItem(KEY)) || {};
    current[familyId] = data;
    await localforage.setItem(KEY, current);
    setLocalData(data);
  };

  const clearLocalEdit = async () => {
    const current = (await localforage.getItem(KEY)) || {};
    delete current[familyId];
    await localforage.setItem(KEY, current);
    setLocalData(null);
  };


  
  return { localData, saveLocalEdit, clearLocalEdit };
};
export const saveLocalUser = (userData) => {
  localStorage.setItem('userProfile', JSON.stringify(userData));
};

export const getLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem('userProfile'));
  } catch {
    return null;
  }
};

export const saveLocalFamily = (family) => {
  localStorage.setItem('familyData', JSON.stringify(family));
};

export const getLocalFamily = () => {
  try {
    return JSON.parse(localStorage.getItem('familyData'));
  } catch {
    return null;
  }
};
