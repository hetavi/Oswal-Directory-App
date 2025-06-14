import { ref, get } from 'firebase/database';
import { db } from '../firebase';

export const checkUserExists = async (email) => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  return Object.values(snapshot.val() || {}).some(user => user.email === email);
};

export const getUserRole = async (uid) => {
  const userRef = ref(db, `users/${uid}/role`);
  const snapshot = await get(userRef);
  return snapshot.val();
};