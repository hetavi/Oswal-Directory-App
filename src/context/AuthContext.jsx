import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


 // In your AuthContext.js
useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      try {
        const snapshot = await get(ref(db, `users/${currentUser.uid}`));
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUser({
            ...currentUser, // Firebase auth info
            ...userData    // Your custom user data from DB
          });
          setRole(userData.role || 'member');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      setUser(null);
      setRole('guest');
    }
    setLoading(false);
  });
  return unsubscribeAuth;
}, []);


  const value = {
    user,
    role,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isCommittee: role === 'committee',
    isMember: role === 'member',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};