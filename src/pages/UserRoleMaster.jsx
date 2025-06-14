import React, { useEffect, useState } from 'react';
import { ref, query, orderByChild, equalTo, get, update } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const UserRoleManager = () => {
  const { user } = useAuth();
  const [guests, setGuests] = useState([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load only guest users initially
  useEffect(() => {
    const loadGuests = async () => {
      setLoading(true);
      try {
        const guestsQuery = query(
          ref(db, 'users'),
          orderByChild('role'),
          equalTo('guest')
        );
        console.log("guest",guestsQuery)
        const snapshot = await get(guestsQuery);
        const users = [];
        
        snapshot.forEach((childSnapshot) => {
          users.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        setGuests(users);
      } catch (err) {
        setError('Failed to load guests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGuests();
  }, []);

  // Search by phone number
  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      const results = [];

      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData.mobile && userData.mobile.includes(searchPhone)) {
          results.push({
            id: childSnapshot.key,
            ...userData
          });
        }
      });

      setSearchResults(results);
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle role selection
  const handleRoleSelect = (userId, newRole) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  // Batch update roles
  const updateRolesBatch = async () => {
    const updates = {};
    Object.entries(selectedUsers).forEach(([userId, newRole]) => {
      updates[`users/${userId}/role`] = newRole;
    });

    if (Object.keys(updates).length === 0) {
      setError('No changes selected');
      return;
    }

    setLoading(true);
    try {
      await update(ref(db), updates);
      // Refresh data
      setSelectedUsers({});
      setSearchResults([]);
      setSearchPhone('');
      // Reload guests
      const guestsQuery = query(
        ref(db, 'users'),
        orderByChild('role'),
        equalTo('guest')
      );
      const snapshot = await get(guestsQuery);
      const updatedGuests = [];
      snapshot.forEach(child => {
        updatedGuests.push({ id: child.key, ...child.val() });
      });
      setGuests(updatedGuests);
    } catch (err) {
      setError('Batch update failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Display users (either search results or guests)
  const displayUsers = searchPhone ? searchResults : guests;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">User Role Management</h1>
      
      {/* Search Section */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search by phone number"
          className="flex-1 p-2 border rounded"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <button 
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* User List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">
          {searchPhone ? 'Search Results' : 'Guest Users'}
        </h2>
        
        {loading && !displayUsers.length ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : displayUsers.length === 0 ? (
          <p>No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Current Role</th>
                  <th className="p-2 border">New Role</th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{user.name || 'N/A'}</td>
                    <td className="p-2 border">{user.mobile || 'N/A'}</td>
                    <td className="p-2 border capitalize">{user.role}</td>
                    <td className="p-2 border">
                      <select
                        value={selectedUsers[user.id] || user.role}
                        onChange={(e) => handleRoleSelect(user.id, e.target.value)}
                        className="border rounded p-1 w-full"
                      >
                        <option value="guest">Guest</option>
                        <option value="member">Member</option>
                        <option value="committee">Committee</option>
                        {user.role === 'admin' && <option value="admin">Admin</option>}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Batch Update Button */}
      {Object.keys(selectedUsers).length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={updateRolesBatch}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={loading}
          >
            {loading ? 'Saving...' : `Save ${Object.keys(selectedUsers).length} Changes`}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserRoleManager;