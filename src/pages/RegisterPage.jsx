// RegisterPage.jsx
import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    authType: 'gmail',
    name: '',
    mobile: '',
    altMobile: '',
    native: '',
    current: '',
    gmail: '',
    password: '',
    confirmPassword: '',
    pin: '',
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
      const usersSnapshot = await get(ref(db, 'users'));

      // 1. Authentication
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

      // 2. Prevent duplicate user
      const isDuplicate = Object.values(usersSnapshot.val() || {}).some(
        (user) => user.gmail === email
      );
      if (isDuplicate) {
        return setError('Email already registered.');
      }

      // 3. Family linking logic
      const familiesSnapshot = await get(ref(db, 'families'));
      const families = familiesSnapshot.val() || {};
      let linkedFamilyId = null;
      let matchedRole = 'guest';
      let matchedStatus = 'pending';
      let matchedBy = 'none';

      for (const [fid, fam] of Object.entries(families)) {
        const pinMatches = fam.pin && formData.pin === fam.pin;
        const members = fam.members || [];

        const mobileMatch = members.some((m) => m.mobile === formData.mobile);
        const altMobileMatch = members.some((m) => m.mobile === formData.altMobile);

        if (pinMatches && mobileMatch) {
          linkedFamilyId = fid;
          matchedRole = 'member';
          matchedStatus = 'approved';
          matchedBy = 'mobile';
          break;
        } else if (pinMatches && altMobileMatch) {
          linkedFamilyId = fid;
          matchedRole = 'member';
          matchedStatus = 'approved';
          matchedBy = 'altMobile';
          break;
        } else if (pinMatches) {
          linkedFamilyId = fid;
          matchedRole = 'guest';
          matchedStatus = 'pending';
          matchedBy = 'pinOnly';
          break;
        }
      }

      // 4. Create new family if no match
      let isNewFamily = false;
      if (!linkedFamilyId) {
        linkedFamilyId = `fam_${uid}`;
        isNewFamily = true;

        const newFamily = {
          id: linkedFamilyId,
          native: formData.native,
          current: formData.current,
          createdBy: uid,
          pin: '0000',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          approved: false,
          members: [
            {
              name: formData.name,
              mobile: formData.mobile,
              relation: 'Self',
              role: 'family_member',
              isPrimary: true,
            },
          ],
        };

        localStorage.setItem('draftFamily', JSON.stringify(newFamily));
        await set(ref(db, `families/${linkedFamilyId}`), newFamily);
      }

      // 5. Save user profile
      const userProfile = {
        name: formData.name,
        mobile: formData.mobile,
        native: formData.native,
        current: formData.current,
        gmail: email,
        role: matchedRole,
        status: matchedStatus,
        familyId: linkedFamilyId,
        createdFamily: isNewFamily,
      };

      await set(ref(db, `users/${uid}`), userProfile);

      // 6. Add/update member to family
      if (!isNewFamily && linkedFamilyId) {
        const familyMembersRef = ref(db, `families/${linkedFamilyId}/members`);
        const familyMembersSnap = await get(familyMembersRef);
        let members = familyMembersSnap.exists() ? familyMembersSnap.val() : [];

        const existingIndex = Object.values(members).findIndex(
          (m) => m.mobile === formData.mobile
        );

        const memberData = {
          name: formData.name,
          mobile: formData.mobile,
          relation: 'Self',
          role: matchedRole === 'member' ? 'family_member' : 'guest',
          isPrimary: true,
        };

        if (existingIndex !== -1) {
          const memberKey = Object.keys(members)[existingIndex];
          await set(ref(db, `families/${linkedFamilyId}/members/${memberKey}`), memberData);
        } else {
          const newMemberIndex = Object.keys(members).length;
          await set(ref(db, `families/${linkedFamilyId}/members/${newMemberIndex}`), memberData);
        }
      }

      // 7. Store and redirect
      localStorage.setItem('userProfile', JSON.stringify({ ...userProfile, uid }));

      if (isNewFamily) {
        alert('Registration successful. Please complete your family setup.');
        navigate('/families/new');
      } else if (matchedRole === 'member') {
        alert('You have been successfully linked as a family member.');
        navigate('/family');
      } else {
        alert('You have been linked to a family as guest.');
        navigate('/family');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Register</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border p-2" name="name" placeholder="Name" onChange={handleChange} required />
        <input className="w-full border p-2" name="mobile" placeholder="Your Mobile Number" onChange={handleChange} required />
        <input className="w-full border p-2" name="altMobile" placeholder="Other Member's Mobile (optional)" onChange={handleChange} />
        <input className="w-full border p-2" name="pin" placeholder="Family PIN (if available)" onChange={handleChange} />

        {!formData.pin && (
          <>
            <input className="w-full border p-2" name="native" placeholder="Native Location" onChange={handleChange} required />
            <input className="w-full border p-2" name="current" placeholder="Current Location" onChange={handleChange} required />
          </>
        )}

        <div className="flex space-x-6 items-center">
          <label className="flex items-center space-x-1">
            <input type="radio" name="authType" value="gmail" checked={formData.authType === 'gmail'} onChange={handleChange} />
            <span>Use Gmail</span>
          </label>
          <label className="flex items-center space-x-1">
            <input type="radio" name="authType" value="email" checked={formData.authType === 'email'} onChange={handleChange} />
            <span>Use Email</span>
          </label>
        </div>
        <p className="text-sm text-gray-600">📌 यदि आप Gmail चुनते हैं, तो पासवर्ड की आवश्यकता नहीं है।</p>

        {formData.authType === 'email' && (
          <>
            <input className="w-full border p-2" name="gmail" placeholder="Email" type="email" onChange={handleChange} required />
            <input className="w-full border p-2" name="password" placeholder="Password" type="password" onChange={handleChange} required />
            <input className="w-full border p-2" name="confirmPassword" placeholder="Confirm Password" type="password" onChange={handleChange} required />
          </>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          {formData.authType === 'gmail' ? 'Register with Google' : 'Register with Email'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
