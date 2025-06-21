// src/pages/FamilyDirectory.jsx
import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";

const FamilyDirectory = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users'); // assuming 'users' is your DB node

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const membersList = [];

      for (let key in data) {
        membersList.push({
          id: key,
          ...data[key]
        });
      }

      setMembers(membersList);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-center mb-4">Family Directory</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        <select className="border p-2 rounded">
          <option value="">Native Place</option>
          {/* Populate with unique native places if needed */}
        </select>
        <select className="border p-2 rounded">
          <option value="">Current Place</option>
          {/* Populate with unique current places if needed */}
        </select>
      </div>

      {/* Cards */}
      {members.length === 0 ? (
        <p className="text-center">No members found.</p>
      ) : (
        members.map((member) => (
          <div key={member.id} className="flex justify-between items-center bg-gray-200 p-4 rounded mb-3">
            <div>
              <p className="font-semibold">{member.currentLocation} - {member.nativeLocation}</p>
              <p>{member.name}</p>
            </div>
            <div className="flex gap-3">
              <a href={`tel:${member.mobile}`} className="text-black text-2xl">📞</a>
              <a href={`https://wa.me/${member.mobile}`} target="_blank" rel="noopener noreferrer">
                <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="WhatsApp" className="w-6 h-6" />
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FamilyDirectory;
