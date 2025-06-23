import React, { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../../firebase';
import localforage from 'localforage';
import { Link, useNavigate } from 'react-router-dom';
import SyncButton from './SyncButton';
import { useAuth } from '../../context/AuthContext';

const EditMemberModal = ({ member, onChange, onClose }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Edit Member</h3>
        <input
          type="text"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Name"
          value={member.name}
          onChange={(e) => onChange({ ...member, name: e.target.value })}
        />
        <input
          type="text"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Mobile"
          value={member.mobile || ''}
          onChange={(e) => onChange({ ...member, mobile: e.target.value })}
        />
        <select
          className="w-full p-2 mb-4 border rounded"
          value={member.sex || ''}
          onChange={(e) => onChange({ ...member, sex: e.target.value })}
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
  const [editedFamilies, setEditedFamilies] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [nativeFilter, setNativeFilter] = useState('');
  const [currentFilter, setCurrentFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const { user } = useAuth();
  const role = user?.role;
  const familyId = user?.familyId;

  const FAMILY_KEY = 'localFamilies';
  const EDIT_KEY = 'editedFamilies';
  const SYNC_KEY = 'lastSynced';

  useEffect(() => {
    const loadLocal = async () => {
      const localData = await localforage.getItem(FAMILY_KEY);
      const editedData = await localforage.getItem(EDIT_KEY);
      setFamilies(localData || []);
      setEditedFamilies(editedData || {});
    };
    loadLocal();
  }, []);

  const uniqueNatives = [...new Set(families.map(f => f.native).filter(Boolean))];
  const uniqueCurrents = [...new Set(families.map(f => f.current).filter(Boolean))];

  const filteredFamilies = families.filter(family =>
    (nativeFilter === '' || family.native === nativeFilter) &&
    (currentFilter === '' || family.current === currentFilter) &&
    (
      family.native?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.current?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.members?.some(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.mobile && member.mobile.includes(searchTerm))
      )
    )
  );

  const canEditFamily = (family) =>
    role === 'admin' || role === 'committee' || family.id === familyId;

  const handleMemberEditClick = (fid, index) => {
    setSelectedFamilyId(fid);
    setSelectedMemberIndex(index);
    const fam = families.find(f => f.id === fid);
    setSelectedMember({ ...fam.members[index] });
  };

  const handleMemberChange = async (updatedMember) => {
    const updatedFamilies = families.map(fam => {
      if (fam.id === selectedFamilyId) {
        const updatedMembers = [...fam.members];
        updatedMembers[selectedMemberIndex] = updatedMember;
        return { ...fam, members: updatedMembers };
      }
      return fam;
    });

    setFamilies(updatedFamilies);
    setSelectedMember(updatedMember);

    const edited = { ...editedFamilies };
    edited[selectedFamilyId] = updatedFamilies.find(f => f.id === selectedFamilyId);
    setEditedFamilies(edited);
    await localforage.setItem(EDIT_KEY, edited);
  };

  const handleSyncToFirebase = async () => {
    for (const [id, fam] of Object.entries(editedFamilies)) {
      const updatedRef = ref(db, `families/${id}`);
      await set(updatedRef, { ...fam, updatedAt: Date.now() });
    }
    await localforage.setItem(EDIT_KEY, {});
    setEditedFamilies({});
    alert('Changes synced successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-1 ">
   <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">

{/* Heading + Add/Edit Button in same row */}
<div className="flex items-center gap-4 flex-wrap">
  <h1 className="text-3xl font-bold text-gray-800">Family Directory</h1>
  {user && (role === 'admin' || role === 'committee') && (
    <Link
      to="/families/new"
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
    >
      Add New Family
    </Link>
  )}
  {user && (role === 'member' || role === 'guest') && (
    <Link
      to={`/families/edit/${familyId}`}
      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium text-sm"
    >
      Edit My Family
    </Link>
  )}
</div>

{/* Sync Button */}
<SyncButton />

{/* Sync Changes button */}
{Object.keys(editedFamilies).length > 0 && (
  <button
    onClick={handleSyncToFirebase}
    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
  >
    Sync Changes
  </button>
)}
</div>


      {/* Filters */}
      <input
            type="text"
            placeholder="Search by name, location, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
      <div className="flex flex-wrap items-start gap-4 mb-6">

      
  {/* Native Dropdown */}
  <div className="flex flex-col min-w-[200px]">
  
    <select
      value={nativeFilter}
      onChange={(e) => setNativeFilter(e.target.value)}
      className="border px-4 py-2 rounded"
    >
      <option value="">All</option>
      {uniqueNatives.map(n => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  </div>

  {/* Current Horizontal Picker */}
  <div className="flex-1 overflow-x-auto whitespace-nowrap">
   
    <div className="flex gap-2">
      <button
        onClick={() => setCurrentFilter('')}
        className={`px-3 py-1 border rounded-full ${currentFilter === '' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
      >
        All
      </button>
      {uniqueCurrents.map(curr => (
        <button
          key={curr}
          onClick={() => setCurrentFilter(curr)}
          className={`px-3 py-1 border rounded-full ${currentFilter === curr ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          {curr}
        </button>
      ))}
    </div>
  </div>
</div>


      {filteredFamilies.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-gray-50">
          <p className="text-lg text-gray-500">No families found</p>
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
                      <a href={`tel:${member.mobile}`} className="text-xl hover:text-green-600">📞</a>
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
          onClose={() => {
            setSelectedMember(null);
            setSelectedFamilyId(null);
            setSelectedMemberIndex(null);
          }}
        />
      )}
    </div>
  );
};

export default FamilyList;
