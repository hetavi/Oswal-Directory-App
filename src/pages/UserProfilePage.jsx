import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { ref, get, update } from 'firebase/database';
import localforage from 'localforage';

const UserProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [familyPin, setFamilyPin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser?.uid;

  // Load cached data from localforage initially
  useEffect(() => {
    const loadFromCache = async () => {
      if (!uid) return;

      const cached = await localforage.getItem(`user-${uid}`);
      if (cached) {
        setUserData(cached);
        if (cached.familyId) {
          const pinSnap = await get(ref(db, `families/${cached.familyId}/pin`));
          setFamilyPin(pinSnap.val());
        }
      }
      setLoading(false);
    };

    loadFromCache();
  }, [uid]);

  // Re-fetch fresh data only when entering edit mode
  const fetchFreshUser = async () => {
    try {
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);
      const data = snapshot.val();

      setUserData(data);
      setOriginalData(data); // Save original for comparison
      await localforage.setItem(`user-${uid}`, data); // ✅ Update local cache

      if (data?.familyId) {
        const pinSnap = await get(ref(db, `families/${data.familyId}/pin`));
        setFamilyPin(pinSnap.val());
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const handleEdit = async () => {
    setIsEditing(true);
    await fetchFreshUser(); // Refresh data before editing
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await update(ref(db, `users/${uid}`), {
        name: userData.name,
        mobile: userData.mobile,
        native: userData.native,
        current: userData.current,
      });

      const updatedUser = { ...userData };
      await localforage.setItem(`user-${uid}`, updatedUser); // update cache

      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  const hasChanges = () => {
    if (!originalData || !userData) return false;
    return (
      originalData.name !== userData.name ||
      originalData.mobile !== userData.mobile ||
      originalData.native !== userData.native ||
      originalData.current !== userData.current
    );
  };

  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>No user data found.</p>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">My Profile</h2>

      <div className="space-y-4">
        <InputField name="name" label="Name" value={userData.name} onChange={handleChange} disabled={!isEditing} />
        <InputField name="mobile" label="Mobile" value={userData.mobile} onChange={handleChange} disabled={!isEditing} />
        <InputField name="native" label="Native" value={userData.native} onChange={handleChange} disabled={!isEditing} />
        <InputField name="current" label="Current Location" value={userData.current} onChange={handleChange} disabled={!isEditing} />

        <InputField label="Email" value={userData.gmail} disabled />
        <div className="flex gap-4">
          <InputField label="Role" value={userData.role} disabled />
          <InputField label="Status" value={userData.status} disabled />
        </div>
        <InputField label="Family ID" value={userData.familyId || 'Not Linked'} disabled />
        <InputField label="Family PIN" value={familyPin || 'N/A'} disabled />

        <div className="flex justify-between pt-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded text-white ${hasChanges() ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                disabled={!hasChanges()}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setUserData(originalData); // reset to original
                  setIsEditing(false);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Refresh & Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable input field component
const InputField = ({ name, label, value, onChange, disabled }) => (
  <div className="w-full">
    <label className="block font-semibold">{label}</label>
    <input
      type="text"
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border p-2 ${disabled ? 'bg-gray-100' : ''}`}
    />
  </div>
);

export default UserProfilePage;
