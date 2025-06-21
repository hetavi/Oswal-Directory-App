import React, { useEffect, useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const CreateFamilyPage = () => {
  const [familyData, setFamilyData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('pendingFamily');
    if (stored) {
      setFamilyData(JSON.parse(stored));
    }
  }, []);

  const handleConfirm = async () => {
    if (!familyData) return;
    await set(ref(db, `families/${familyData.id}`), familyData);
    localStorage.removeItem('pendingFamily');
    alert('Family created successfully!');
    navigate('/family');
  };

  if (!familyData) return <p>No pending family data found.</p>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Confirm Family Information</h2>
      <p><strong>Native:</strong> {familyData.native}</p>
      <p><strong>Current:</strong> {familyData.current}</p>
      <p><strong>PIN:</strong> {familyData.pin}</p>
      <button
        onClick={handleConfirm}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Confirm & Create Family
      </button>
    </div>
  );
};

export default CreateFamilyPage;