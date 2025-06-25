import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../firebase';
import { saveLocalUser, getLocalUser } from './localStorageUtils';


export const useAuthUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
console.log("use auth hooks")
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const uid = firebaseUser.uid;
      let userData = getLocalUser();

      // Try to load from DB if local is missing
      if (!userData || userData.uid !== uid) {
        const userSnap = await get(ref(db, `users/${uid}`));
        userData = { ...userSnap.val(), uid };
        saveLocalUser(userData);
      }

      // If guest + owns family, check for approval
      if (
        userData.role === 'guest' &&
        userData.familyId &&
        userData.familyId !== '0000'
      ) {
        const famSnap = await get(ref(db, `families/${userData.familyId}`));
        const family = famSnap.val();

        if (family?.approved && family?.createdBy === uid) {
          userData.role = 'member';
          await set(ref(db, `users/${uid}/role`), 'member');
          saveLocalUser(userData);
        }
      }

      setUser(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};
