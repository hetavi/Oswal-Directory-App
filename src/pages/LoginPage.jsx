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
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;

      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        // First-time Google login
        await set(userRef, {
          email: result.user.email,
          role: 'member',
        });
        await set(ref(db, 'member_requests/' + uid), {
          name: result.user.displayName || '',
          gmail: result.user.email,
          status: 'pending',
        });
        alert('You have been registered. Awaiting committee approval.');
      }

      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Login</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input className="w-full border p-2" type="email" placeholder="Gmail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm">OR</p>
        <button onClick={handleGoogleLogin} className="mt-2 bg-red-500 text-white py-2 px-4 rounded">Login with Google</button>
      </div>
    </div>
  );
};

export default LoginPage;
