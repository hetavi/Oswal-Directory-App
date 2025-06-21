// Updated FamilyLinkPrompt.jsx
import React, { useEffect, useState } from 'react';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../../context/AuthContext';

const FamilyLinkPrompt = () => {
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const findFamily = async () => {
      const snapshot = await get(ref(db, 'families'));
      const families = snapshot.val();
      for (const [familyId, family] of Object.entries(families || {})) {
        if (family.members) {
          for (const member of family.members) {
            if (member.mobile === user.mobile) {
              setMatch({ familyId, family });
              setLoading(false);
              return;
            }
          }
        }
      }
      setLoading(false);
    };

    if (user?.mobile && !user.familyId) findFamily();
  }, [user]);

  const handlePinVerify = async () => {
    setPinError('');
    const pinSnap = await get(ref(db, `families/${match.familyId}/private/pin`));
    if (pinSnap.exists() && pinSnap.val() === pinInput) {
      await update(ref(db, `users/${user.uid}`), {
        familyId: match.familyId,
        role: 'member',
      });
      alert('Family linked and role updated to Member.');
      setDone(true);
    } else {
      setPinError('Incorrect PIN');
    }
  };

  if (loading || done) return null;

  if (!match) {
    return (
      <div className="bg-yellow-50 border p-4 rounded my-4">
        <p>No matching family found for mobile: <b>{user.mobile}</b></p>
        <p>You can add your family manually from the Directory page.</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border p-4 rounded my-4">
      <p>We found a family that might match your mobile number:</p>
      <p><b>Family Head:</b> {match.family.head}</p>
      <p><b>Pin (required to verify link):</b></p>
      <input
        type="password"
        value={pinInput}
        onChange={(e) => setPinInput(e.target.value)}
        className="border px-2 py-1 rounded w-full mt-1"
      />
      {pinError && <p className="text-red-600 text-sm">{pinError}</p>}
      <button
        onClick={handlePinVerify}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Link Me to This Family
      </button>
    </div>
  );
};

export default FamilyLinkPrompt;
