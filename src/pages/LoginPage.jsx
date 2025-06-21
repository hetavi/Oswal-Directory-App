// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../firebase';
import { ref, get, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.log('🔵 Attempting login with email/password:', email);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful:', result.user);
      console.log('👉 Current user after login:', auth.currentUser);
      navigate('/');
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    console.log('🔵 Starting Google sign-in flow');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const uid = user.uid;

      console.log('✅ Google sign-in successful:', user);
      console.log('👉 Firebase currentUser:', auth.currentUser);

      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        console.log('🆕 New Google user. Creating user record in DB');
        await set(userRef, {
          email: user.email,
          name: user.displayName || '',
          role: 'guest',
          status: 'pending',
        });

        await set(ref(db, 'member_requests/' + uid), {
          name: user.displayName || '',
          gmail: user.email,
          status: 'pending',
        });

        alert('✅ You have been registered. Awaiting committee approval.');
      } else {
        console.log('✅ Existing Google user found in DB');
      }

      navigate('/');
    } catch (err) {
      console.error('❌ Google login failed:', err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Login</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          className="w-full border p-2"
          type="email"
          placeholder="Gmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm">OR</p>
        <button
          onClick={handleGoogleLogin}
          className="mt-2 bg-red-500 text-white py-2 px-4 rounded"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
