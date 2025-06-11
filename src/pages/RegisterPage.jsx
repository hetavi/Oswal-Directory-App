// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    native: '',
    current: '',
    gmail: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    const isDuplicate = Object.values(snapshot.val() || {}).some(user => user.gmail === formData.gmail);

    if (isDuplicate) return setError('Email already registered.');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.gmail, formData.password);
      const uid = userCredential.user.uid;

      await set(ref(db, 'member_requests/' + uid), {
        name: formData.name,
        mobile: formData.mobile,
        native: formData.native,
        current: formData.current,
        gmail: formData.gmail,
        status: 'pending'
      });

      alert('Registration successful. Awaiting committee approval.');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Register</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border p-2" name="name" placeholder="Name" onChange={handleChange} required />
        <input className="w-full border p-2" name="mobile" placeholder="Mobile Number" onChange={handleChange} required />
        <input className="w-full border p-2" name="native" placeholder="Native Location" onChange={handleChange} required />
        <input className="w-full border p-2" name="current" placeholder="Current Location" onChange={handleChange} required />
        <input className="w-full border p-2" name="gmail" placeholder="Gmail" type="email" onChange={handleChange} required />
        <input className="w-full border p-2" name="password" placeholder="Password" type="password" onChange={handleChange} required />
        <input className="w-full border p-2" name="confirmPassword" placeholder="Confirm Password" type="password" onChange={handleChange} required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
