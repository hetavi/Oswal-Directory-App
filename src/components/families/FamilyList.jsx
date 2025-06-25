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
  const { families, setFamilies, loading } = useFamilySync();
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
    <div className="max-w-7xl mx-auto px-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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

      <input
        type="text"
        placeholder="Search by name, location, or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
      />

      <div className="flex flex-wrap items-start gap-4 mb-6">
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
