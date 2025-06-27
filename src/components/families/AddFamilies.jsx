import React, { useState, useEffect } from 'react';
import { ref, push, set, get } from 'firebase/database';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import localforage from 'localforage';

const normalizeMobile = (m) => m.replace(/\D/g, '').slice(-10);

const AddFamilies = ({ onFamiliesAdded }) => {
  const { user } = useAuth();
//  const uid = auth.currentUser?.uid;
  console.log('user', user);
  const [families, setFamilies] = useState([{ current: '', name: '', mobile: '', exists: false }]);
  const [existingMobiles, setExistingMobiles] = useState(new Set());

  useEffect(() => {
    const loadMobiles = async () => {
      const existingSet = new Set();

      const localData = await localforage.getItem('familyData');
      if (localData) {
        Object.values(localData).forEach(f => {
          Object.values(f.members || {}).forEach(m => {
            existingSet.add(normalizeMobile(m.mobile));
          });
        });
      }

      const snap = await get(ref(db, 'families'));
      if (snap.exists()) {
        Object.values(snap.val()).forEach(f => {
          Object.values(f.members || {}).forEach(m => {
            existingSet.add(normalizeMobile(m.mobile));
          });
        });
      }

      setExistingMobiles(existingSet);
    };

    loadMobiles();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...families];
    updated[index][field] = value;

    if (field === 'mobile') {
      const mobile = normalizeMobile(value);
      updated[index].exists = existingMobiles.has(mobile);
    }

    setFamilies(updated);

    const isLast = index === families.length - 1;
    if (
      isLast &&
      field === 'mobile' &&
      value &&
      updated[index].current &&
      updated[index].name &&
      !updated[index].exists
    ) {
      setFamilies([...updated, { current: '', name: '', mobile: '', exists: false }]);
    }
  };

  const handleSubmit = async () => {
    const validFamilies = families.filter(f => f.name && f.mobile && f.current && !f.exists);
    let addedCount = 0;
    const newMobiles = new Set();

    for (let f of validFamilies) {
      const mobile = normalizeMobile(f.mobile);
      if (existingMobiles.has(mobile) || newMobiles.has(mobile)) continue;

      const id = push(ref(db, 'families')).key;
      const pin = Math.floor(1000 + Math.random() * 9000).toString();

      await set(ref(db, `families/${id}`), {
        id,
        native: '',
        current: f.current,
        members: {
          0: {
            name: f.name,
            mobile: f.mobile,
            role: 'family_head',
            isPrimary: true,
          }
        },
        pin,
        approved: false,
        createdBy: user?.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      newMobiles.add(mobile);
      addedCount++;
    }

    if (addedCount > 0) {
      alert(`${addedCount} families added successfully`);
      setFamilies([{ current: '', name: '', mobile: '', exists: false }]);
      onFamiliesAdded?.();
    } else {
      alert('No new families added (duplicates skipped)');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Add Families</h2>
      <div className="space-y-2">
        {families.map((f, i) => (
          <div key={i} className="flex gap-2 items-start">

<div className="w-1/3">
<div className="w-1/3">
  <input
    type="tel"
    placeholder="Mobile (+91...)"
    value={f.mobile}
    onFocus={() => {
      if (!f.mobile || !f.mobile.startsWith('+')) {
        handleChange(i, 'mobile', '+91');
      }
    }}
    onChange={(e) => handleChange(i, 'mobile', e.target.value)}
    className={`input input-bordered w-full ${f.exists ? 'border-red-400 bg-red-50' : ''}`}
  />
  {f.exists && <p className="text-red-500 text-xs">Already in list</p>}
</div>

              {f.exists && <p className="text-red-500 text-xs">Already in list</p>}
            </div>


            <input
              type="text"
              placeholder="Current City"
              value={f.current}
              onChange={(e) => handleChange(i, 'current', e.target.value)}
              className="input input-bordered w-1/3"
            />
            <input
              type="text"
              placeholder="Full Name"
              value={f.name}
              onChange={(e) => handleChange(i, 'name', e.target.value)}
              className="input input-bordered w-1/3"
            />
            
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} className="btn btn-primary mt-4">Submit</button>
    </div>
  );
};

export default AddFamilies;
