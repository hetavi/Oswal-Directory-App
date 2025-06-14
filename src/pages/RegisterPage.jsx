import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    authType: 'gmail', // 'gmail' or 'email'
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let userCredential, email;
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);

      if (formData.authType === 'gmail') {
        const provider = new GoogleAuthProvider();
        userCredential = await signInWithPopup(auth, provider);
        email = userCredential.user.email;
      } else {
        if (formData.password !== formData.confirmPassword) {
          return setError('Passwords do not match.');
        }
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.gmail,
          formData.password
        );
        email = formData.gmail;
      }

      const uid = userCredential.user.uid;
      const isDuplicate = Object.values(snapshot.val() || {}).some(
        (user) => user.gmail === email
      );
      if (isDuplicate) return setError('Email already registered.');

      await set(ref(db, 'users/' + uid), {
        name: formData.name,
        mobile: formData.mobile,
        native: formData.native,
        current: formData.current,
        gmail: email,
        role: 'guest',
        status: 'pending',
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
      

        <input
          className="w-full border p-2"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          className="w-full border p-2"
          name="mobile"
          placeholder="Mobile Number"
          onChange={handleChange}
          required
        />
        <input
          className="w-full border p-2"
          name="native"
          placeholder="Native Location"
          onChange={handleChange}
          required
        />
        <input
          className="w-full border p-2"
          name="current"
          placeholder="Current Location"
          onChange={handleChange}
          required
        /> 
          <div className="flex space-x-6 items-center">
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              name="authType"
              value="gmail"
              checked={formData.authType === 'gmail'}
              onChange={handleChange}
            />
            <span>Use Gmail</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              name="authType"
              value="email"
              checked={formData.authType === 'email'}
              onChange={handleChange}
            />
            <span>Use Other Email</span>
          </label>
        </div>
        <p className="text-sm text-gray-600">
          📌 If you choose Gmail, password is not required.
        </p>

        {formData.authType === 'email' && (
          <>
            <input
              className="w-full border p-2"
              name="gmail"
              placeholder="Email"
              type="email"
              onChange={handleChange}
              required
            />
            <input
              className="w-full border p-2"
              name="password"
              placeholder="Password"
              type="password"
              onChange={handleChange}
              required
            />
            <input
              className="w-full border p-2"
              name="confirmPassword"
              placeholder="Confirm Password"
              type="password"
              onChange={handleChange}
              required
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {formData.authType === 'gmail'
            ? 'Register with Google'
            : 'Register with Email'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
