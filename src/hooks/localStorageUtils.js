import localforage from 'localforage';

export const LOCAL_KEY = 'unsyncedEdits';

export const saveUnsyncedChange = async (familyId, updatedMember) => {
  const existing = (await localforage.getItem(LOCAL_KEY)) || {};
  existing[familyId] = updatedMember;
  await localforage.setItem(LOCAL_KEY, existing);
};

export const getUnsyncedChanges = async () => {
  return (await localforage.getItem(LOCAL_KEY)) || {};
};

export const clearUnsyncedChanges = async () => {
  await localforage.removeItem(LOCAL_KEY);
};export const getLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem('userProfile'));
  } catch {
    return null;
  }
};

export const saveLocalUser = (user) => {
  localStorage.setItem('userProfile', JSON.stringify(user));
};

export const getLocalFamily = () => {
  try {
    return JSON.parse(localStorage.getItem('familyData'));
  } catch {
    return null;
  }
};

export const saveLocalFamily = (family) => {
  localStorage.setItem('familyData', JSON.stringify(family));
};

