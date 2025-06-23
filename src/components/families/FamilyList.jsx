import React, { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../../firebase';
import localforage from 'localforage';
import { Link, useNavigate } from 'react-router-dom';
import SyncButton from './SyncButton';
import { useAuth } from '../../context/AuthContext';

const EditMemberModal = ({ member, onChange, onClose }) => {
  if (!member) return null;

  console.log("Rendering EditMemberModal for:", member);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        family list
        <h3 className="text-lg font-semibold mb-4">Edit Member</h3>
        <input
          type="text"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Name"
          value={member.name}
          onChange={(e) => {
            const updated = { ...member, name: e.target.value };
            console.log("Name changed to:", updated.name);
            onChange(updated);
          }}
        />
        <input
          type="text"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Mobile"
          value={member.mobile || ''}
          onChange={(e) => {
            const updated = { ...member, mobile: e.target.value };
            console.log("Mobile changed to:", updated.mobile);
            onChange(updated);
          }}
        />
        <select
          className="w-full p-2 mb-4 border rounded"
          value={member.sex || ''}
          onChange={(e) => {
            const updated = { ...member, sex: e.target.value };
            console.log("Gender changed to:", updated.sex);
            onChange(updated);
          }}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="Female">Female</option>
        </select>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-sm bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

const FamilyList = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const [editedFamilies, setEditedFamilies] = useState({});

  //const { user, role, familyId } = useAuth();
  const { user } = useAuth();
  const role = user?.role;
  const familyId = user?.familyId;
  

  const navigate = useNavigate();

  const FAMILY_KEY = 'localFamilies';
  const EDIT_KEY = 'editedFamilies';
  const SYNC_KEY = 'lastSynced';

  useEffect(() => {
    const loadLocal = async () => {
      console.log("Loading local data...");
      const localData = await localforage.getItem(FAMILY_KEY);
      const editedData = await localforage.getItem(EDIT_KEY);
      console.log("Loaded local families:", localData);
      console.log("Loaded edited families:", editedData);
      setFamilies(localData || []);
      setEditedFamilies(editedData || {});
      setLoading(false);
    };
    loadLocal();
  }, []);

  useEffect(() => {
    const syncFromFirebase = async () => {
      console.log("Syncing data from Firebase...");
      const lastSynced = await localforage.getItem(SYNC_KEY) || 0;
      console.log("Last synced at:", lastSynced);
      const familiesRef = ref(db, 'families');
      onValue(familiesRef, (snapshot) => {
        const allData = snapshot.val() || {};
        const newFamilies = Object.values(allData).filter(fam => fam.updatedAt > lastSynced);
        console.log("New families from Firebase:", newFamilies);
        if (newFamilies.length > 0) {
          setFamilies((prev) => {
            const merged = [...prev];
            newFamilies.forEach((newFam) => {
              const idx = merged.findIndex(f => f.id === newFam.id);
              if (idx !== -1) {
                merged[idx] = newFam;
              } else {
                merged.push(newFam);
              }
            });
            console.log("Merged families:", merged);
            localforage.setItem(FAMILY_KEY, merged);
            return merged;
          });
          localforage.setItem(SYNC_KEY, Date.now());
        }
      });
    };
    syncFromFirebase();
  }, []);

  const handleMemberEditClick = (familyId, index) => {
    console.log("Edit clicked for member index:", index, "of family:", familyId);
    setSelectedFamilyId(familyId);
    setSelectedMemberIndex(index);
    const family = families.find(f => f.id === familyId);
    setSelectedMember({ ...family.members[index] });
  };

  const handleMemberChange = async (updatedMember) => {
    console.log("Member updated to:", updatedMember);
    const updatedFamilies = families.map(fam => {
      if (fam.id === selectedFamilyId) {
        const updatedMembers = [...fam.members];
        updatedMembers[selectedMemberIndex] = updatedMember;
        return { ...fam, members: updatedMembers };
      }
      return fam;
    });

    console.log("Updated families after member edit:", updatedFamilies);
    setFamilies(updatedFamilies);
    setSelectedMember(updatedMember);

    const edited = { ...editedFamilies };
    edited[selectedFamilyId] = updatedFamilies.find(f => f.id === selectedFamilyId);
    console.log("Edited families to be stored:", edited);
    setEditedFamilies(edited);
    await localforage.setItem(EDIT_KEY, edited);
  };

  const handleCloseModal = () => {
    console.log("Closing modal");
    setSelectedMember(null);
    setSelectedFamilyId(null);
    setSelectedMemberIndex(null);
  };

  const handleSyncToFirebase = async () => {
    console.log("Syncing edited families to Firebase:", editedFamilies);
    for (const [id, fam] of Object.entries(editedFamilies)) {
      const updatedRef = ref(db, `families/${id}`);
      await set(updatedRef, { ...fam, updatedAt: Date.now() });
      console.log(`Synced family ${id} to Firebase`);
    }
    await localforage.setItem(EDIT_KEY, {});
    setEditedFamilies({});
    alert('Changes synced successfully');
  };

  const filteredFamilies = families.filter(family =>
    family.native?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.current?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.members?.some(member =>
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.mobile && member.mobile.includes(searchTerm))
    )
  );

  const canEditFamily = (family) =>
    role === 'admin' || role === 'committee' || family.id === familyId;
  

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Family Directory  1</h1>
        <SyncButton />
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name, location, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              console.log("Search term changed to:", e.target.value);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Link
            to="/families/new"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Add New Family
          </Link>
          {Object.keys(editedFamilies).length > 0 && (
            <button
              onClick={handleSyncToFirebase}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Sync Changes
            </button>
          )}
        </div>
      </div>

      {filteredFamilies.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-gray-50">
          <p className="text-lg text-gray-500">
            {searchTerm ? 'No matching families found' : 'No families registered yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFamilies.map(family => (
            <div key={family.id} className="border rounded-xl p-5 shadow-sm bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    <span className="text-blue-600">{family.native}</span> → <span className="text-green-600">{family.current}</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {family.members?.length || 0} member{family.members?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {canEditFamily(family) && (
                  <Link to={`/families/edit/${family.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    ✏️ Edit
                  </Link>
                )}
              </div>
              <div className="space-y-2">
                {family.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border hover:shadow">
                    <div className="flex items-center gap-3 w-full">
                      {member.mobile ? (
                        <a href={`tel:${member.mobile}`} className="text-xl hover:text-green-600" title="Call">📞</a>
                      ) : (
                        <span className="text-xl text-gray-300">📞</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${member.sex === 'male' ? 'text-blue-700' : member.sex === 'Female' ? 'text-pink-600' : 'text-gray-600'}`}>
                          {member.name}
                        </p>
                      </div>
                      {member.mobile ? (
                        <a href={`https://wa.me/${member.mobile}`} target="_blank" rel="noopener noreferrer">
                          <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="WhatsApp" className="w-6 h-6" />
                        </a>
                      ) : (
                        <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="WhatsApp" className="w-5 h-5 opacity-30" />
                      )}
                      {canEditFamily(family) && (
                        <button
                          onClick={() => handleMemberEditClick(family.id, index)}
                          className="text-xs text-blue-500 hover:text-blue-700 ml-2"
                          title="Edit Member"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMember && (
        <EditMemberModal
          member={selectedMember}
          onChange={handleMemberChange}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default FamilyList;
