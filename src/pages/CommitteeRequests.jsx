// src/pages/CommitteeRequests.jsx
import React, { useEffect, useState } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { db } from '../firebase';

const CommitteeRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const reqRef = ref(db, 'committee_requests');
    onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      setRequests(list);
    });
  }, []);

  const handleApprove = async (req) => {
    await update(ref(db, 'users/' + req.id), { role: 'committee' });
    await remove(ref(db, 'committee_requests/' + req.id));
  };

  const handleReject = async (id) => {
    await remove(ref(db, 'committee_requests/' + id));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Committee Member Requests</h1>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map(req => (
            <li key={req.id} className="bg-white p-4 shadow rounded">
              <p><strong>{req.name}</strong> - wants to become a committee member</p>
              <p className="text-sm text-gray-600">📧 {req.gmail}</p>
              <div className="mt-2 space-x-4">
                <button onClick={() => handleApprove(req)} className="text-green-600 hover:underline">Approve</button>
                <button onClick={() => handleReject(req.id)} className="text-red-600 hover:underline">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommitteeRequests;
