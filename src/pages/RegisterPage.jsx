// RegisterPage.jsx
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
    console.log('Form submitted with:', formData);

    try {
      let userCredential, email;

      console.log('Fetching all users...');
      const usersSnapshot = await get(ref(db, 'users'));
      console.log('Users fetched:', usersSnapshot.val());

      if (formData.authType === 'gmail') {
        console.log('Signing in with Google...');
        const provider = new GoogleAuthProvider();
        userCredential = await signInWithPopup(auth, provider);
        email = userCredential.user.email;
        console.log('Google user created:', email);
      } else {
        console.log('Using email/password...');
        if (formData.password !== formData.confirmPassword) {
          return setError('Passwords do not match.');
        }

        console.log('Creating user with email:', formData.gmail);
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.gmail,
          formData.password
        );
        email = formData.gmail;
        console.log('Email user created:', email);
      }

      const uid = userCredential.user.uid;
      console.log('User UID:', uid);

      const isDuplicate = Object.values(usersSnapshot.val() || {}).some(
        (user) => user.gmail === email
      );
      if (isDuplicate) {
        console.log('Duplicate email found:', email);
        return setError('Email already registered.');
      }

      // Family linking
      console.log('Checking for family match...');
      const familiesSnapshot = await get(ref(db, 'families'));
      const families = familiesSnapshot.val() || {};
      let linkedFamilyId = null;
      let matchedRole = 'guest';
      let matchedStatus = 'pending';
      let matchedByOwnMobile = false;

      Object.entries(families).forEach(([fid, fam]) => {
        const members = fam.members || [];
        const mobileMatch = members.some((m) => m.mobile === formData.mobile);
        const altMatch = members.some((m) => m.mobile === formData.altMobile);
        const pinMatches = fam.pin && formData.pin === fam.pin;

        if (!linkedFamilyId && mobileMatch) {
          linkedFamilyId = fid;
          matchedByOwnMobile = true;
          if (pinMatches) {
            matchedRole = 'member';
            matchedStatus = 'approved';
          }
        } else if (!linkedFamilyId && altMatch && pinMatches) {
          linkedFamilyId = fid;
          matchedRole = 'member';
          matchedStatus = 'approved';
        }
      });

      console.log('Matched familyId:', linkedFamilyId);

      // Create new family if not matched
      let isNewFamily = false;
      if (!linkedFamilyId) {
        linkedFamilyId = `fam_${uid}`;
        isNewFamily = true;
        console.log('No family match. Creating new family:', linkedFamilyId);

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
            },
          ],
        };

        localStorage.setItem('draftFamily', JSON.stringify(newFamily));
        await set(ref(db, `families/${linkedFamilyId}`), newFamily);
        console.log('New family created');
      }

      // Save user profile
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

      console.log('Saving user profile...');
      await set(ref(db, `users/${uid}`), userProfile);
      console.log('User profile saved');

      // Add/update family member
      if (linkedFamilyId) {
        console.log('Updating members in family:', linkedFamilyId);
        const familyMembersRef = ref(db, `families/${linkedFamilyId}/members`);
        const familyMembersSnap = await get(familyMembersRef);
        let members = familyMembersSnap.exists() ? familyMembersSnap.val() : [];

        let memberIndex = Object.values(members).findIndex((m) => m.mobile === formData.mobile);
        const memberData = {
          name: formData.name,
          mobile: formData.mobile,
          relation: 'Self',
          role: matchedRole === 'member' ? 'family_member' : 'guest',
          isPrimary: true,
        };

        if (memberIndex !== -1) {
          const memberKey = Object.keys(members)[memberIndex];
          console.log('Updating existing member:', memberKey);
          await set(ref(db, `families/${linkedFamilyId}/members/${memberKey}`), memberData);
        } else {
          const newMemberIndex = Object.keys(members).length;
          console.log('Adding new member at index:', newMemberIndex);
          await set(ref(db, `families/${linkedFamilyId}/members/${newMemberIndex}`), memberData);
        }
      }

      localStorage.setItem('userProfile', JSON.stringify({ ...userProfile, uid }));
      console.log('Local userProfile saved');

      if (matchedRole === 'guest' || isNewFamily) {
        alert('Registration successful. Please create or complete your family.');
        navigate('/families/new');
      } else {
        alert('You have been successfully linked to a family.');
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
        <input className="w-full border p-2" name="native" placeholder="Native Location" onChange={handleChange} required />
        <input className="w-full border p-2" name="current" placeholder="Current Location" onChange={handleChange} required />
        <input className="w-full border p-2" name="pin" placeholder="Family PIN (if available)" onChange={handleChange} />

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
        <p className="text-sm text-gray-600">📌 If you choose Gmail, password is not required.</p>

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
