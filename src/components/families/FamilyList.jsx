import React, { useEffect, useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../../firebase';
import localforage from 'localforage';
import { Link } from 'react-router-dom';
import SyncButton from './SyncButton';
import { useAuth } from '../../context/AuthContext';
import EditMemberModal from './EditMemberModal';
import FamilyCard from './FamilyCard';
import useFamilySync from '../../hooks/useFamilySync';
import { useFamily } from '../../context/FamilyContext';
const FamilyList = () => {
 // const [families, setFamilies] = useState([]);
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
  const { families, setFamilies, loading } = useFamily();
 
  

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
    <div className="max-w-7xl mx-auto px-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex items-center gap-4 flex-nowrap overflow-x-auto min-w-0">
  <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap">Family Directory</h1>

  {user && (role === 'admin' || role === 'committee') && (
    <Link
      to="/families/new"
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm whitespace-nowrap"
    >
      Add New Family
    </Link>
  )}

  {user && (role === 'member' || role === 'guest') && (
    <Link
      to={`/families/edit/${familyId}`}
      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium text-sm whitespace-nowrap"
    >
      Edit My Family
    </Link>
  )}
</div>


        <SyncButton />

        {Object.keys(editedFamilies).length > 0 && (
          <button
            onClick={handleSyncToFirebase}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Sync Changes
          </button>
        )}
      </div>
{/* 🔹 Current City Buttons */}
<div className="flex items-center gap-2 overflow-x-auto pb-2 mb-1">
  <button
    onClick={() => setCurrentFilter('')}
    className={`shrink-0 px-2 py-1 border rounded-full ${currentFilter === '' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
  >
    All
  </button>

  <div className="flex gap-2">
    {uniqueCurrents.map(curr => (
      <button
        key={curr}
        onClick={() => setCurrentFilter(curr)}
        className={`px-3 py-1 border rounded-full whitespace-nowrap ${currentFilter === curr ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
      >
        {curr}
      </button>
    ))}
  </div>
</div>

{/* 🔹 Native + Search Filter Row (Always one row) */}
<div className="flex gap-4 mb-1 w-full">
  <div className="w-[40%]">
    <select
      value={nativeFilter}
      onChange={(e) => setNativeFilter(e.target.value)}
      className="w-full border px-1 py-2 rounded"
    >
      <option value="">All</option>
      {uniqueNatives.map(n => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  </div>

  <div className="w-[60%]">
    <input
      type="text"
      placeholder="Search by name, location, or phone..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    />
  </div>
</div>

    

      {filteredFamilies.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-gray-50">
          <p className="text-lg text-gray-500">No families found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFamilies.map(family => (
            <FamilyCard
              key={family.id}
              family={family}
              canEdit={canEditFamily(family)}
              onMemberEdit={handleMemberEditClick}
            />
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
