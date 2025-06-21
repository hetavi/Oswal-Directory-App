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

export const getFamilyByPhoneOrPin = async (mobile, altMobile, pin) => {
  const snapshot = await get(ref(db, 'families'));
  const families = snapshot.val() || {};

  for (const [fid, fam] of Object.entries(families)) {
    const members = fam.members || [];
    const pinMatches = fam.pin && pin === fam.pin;
    const mobileMatch = members.some((m) => m.mobile === mobile);
    const altMatch = members.some((m) => m.mobile === altMobile);
    if ((mobileMatch || altMatch) && pinMatches) return fid;
    if (mobileMatch && !pin) return fid; // guest match
  }
  return null;
};

