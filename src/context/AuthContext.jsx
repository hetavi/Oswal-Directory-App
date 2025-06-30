import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import localforage from 'localforage';
import { db } from '../firebase';

import { useAuthUser } from '../hooks/useAuthUser';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user: firebaseUser, loading: authLoading } = useAuthUser();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest');
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState(null);
  const [needsFamilyLinking, setNeedsFamilyLinking] = useState(false);
  console.log('subit')
  useEffect(() => {
    const loadUserData = async () => {
      if (!firebaseUser) {
        setUser(null);
        setRole('guest');
        setNeedsFamilyLinking(false);
        setHydrated(true);
        return;
      }

      try {
        const cached = await localforage.getItem(`user-${firebaseUser.uid}`);
        if (cached) {
          const fullUser = {
            ...cached,
            uid: firebaseUser.uid, // ✅ ensure uid is always included
          };
          setUser(fullUser);
          setRole(cached.role || 'member');
          setNeedsFamilyLinking(!cached.familyId && !!cached.mobile);
          setHydrated(true);
          return;
        }

        const snapshot = await get(ref(db, `users/${firebaseUser.uid}`));
        if (snapshot.exists()) {
          const dbUser = snapshot.val();

          const fullUser = {
            uid: firebaseUser.uid, // ✅ always include Firebase uid
            email: firebaseUser.email || dbUser.email,
            displayName: firebaseUser.displayName || dbUser.name,
            photoURL: firebaseUser.photoURL,
            ...dbUser,
          };

          setUser(fullUser);
          setRole(dbUser.role || 'member');
          setNeedsFamilyLinking(!dbUser.familyId && !!dbUser.mobile);
          await localforage.setItem(`user-${firebaseUser.uid}`, fullUser);
        }

        setHydrated(true);
      } catch (err) {
        setError(err);
        console.error('Failed to load user data:', err);
        setHydrated(true);
      }
    };

    loadUserData();
  }, [firebaseUser]);

  const value = {
    user,
    role,
    loading: authLoading || !hydrated,
    error,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isCommittee: role === 'committee',
    isMember: role === 'member',
    needsFamilyLinking,
  };

  return (
    <AuthContext.Provider value={value}>
      {!value.loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
