// src/pages/UserRoleMaster.jsx
import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

const UserRoleMaster = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const userList = data ? Object.entries(data).map(([id, info]) => ({ id, ...info })) : [];
      setUsers(userList);
    });
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">User & Role Master</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Mobile</th>
              <th className="p-2 border">Native</th>
              <th className="p-2 border">Current</th>
              <th className="p-2 border">Gmail</th>
              <th className="p-2 border">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-sm">
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.mobile}</td>
                <td className="p-2 border">{user.native}</td>
                <td className="p-2 border">{user.current}</td>
                <td className="p-2 border">{user.gmail}</td>
                <td className="p-2 border capitalize">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRoleMaster;
