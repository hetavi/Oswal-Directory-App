import React, { useState, useEffect } from 'react';
import { ref, set, push, update, get } from 'firebase/database';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import MemberForm from './MemberForm';

const FamilyForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdminOrCommittee = user?.role === 'admin' || user?.role === 'committee';

  const initialFormData = {
    native: '',
    current: '',
    members: isAdminOrCommittee
      ? []
      : [
          {
            name: user?.name || '',
            mobile: user?.mobile || '',
            birthday: '',
            mStatus: '',
            sex: '',
            edu: '',
            job: '',
            others: '',
            relation: '',
            role: 'family_head',
            userId: user?.uid || null,
          },
        ],
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (id) {
      const loadFamilyData = async () => {
        setLoading(true);
        try {
          const snapshot = await get(ref(db, `families/${id}`));
          if (snapshot.exists()) {
            setFormData(snapshot.val());
          }
        } catch (err) {
          setError('Failed to load family data');
        } finally {
          setLoading(false);
        }
      };
      loadFamilyData();
    }
  }, [id]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;

    if (name === 'native' || name === 'current') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      const updatedMembers = [...formData.members];
      updatedMembers[index] = { ...updatedMembers[index], [name]: value };
      setFormData(prev => ({ ...prev, members: updatedMembers }));
    }
  };

  const addMember = () => {
    const newMember = {
      name: '',
      mobile: '',
      birthday: '',
      mStatus: '',
      sex: '',
      edu: '',
      job: '',
      others: '',
      relation: '',
      role: 'family_member',
    };
    setFormData(prev => ({ ...prev, members: [...prev.members, newMember] }));
  };

  const removeMember = index => {
    if (!isAdminOrCommittee && formData.members.length <= 1) return;
    const updatedMembers = [...formData.members];
    updatedMembers.splice(index, 1);
    setFormData(prev => ({ ...prev, members: updatedMembers }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.members.length === 0) {
      setError('Please add at least one family member');
      return;
    }
    setLoading(true);
    try {
      if (id) {
        await update(ref(db, `families/${id}`), {
          ...formData,
          updatedAt: Date.now(),
        });
      } else {
        const isPrivileged = isAdminOrCommittee;
        const isGuest = user?.role === 'guest';
        const familyId = isPrivileged ? push(ref(db, 'families')).key : `fam_${user?.uid}`;
        const newFamilyRef = ref(db, `families/${familyId}`);
        const pin = isGuest ? '0000' : Math.floor(1000 + Math.random() * 9000).toString();
        await set(newFamilyRef, {
          ...formData,
          id: familyId,
          pin,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: user?.uid,
          approved: false,
        });
      }
      navigate('/families');
    } catch (err) {
      setError('Failed to save family data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">Loading...</div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto bg-slate-100 px-1 py-1">
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-1 bg-white p-1 rounded-xl shadow-sm">
      <div className="flex gap-4 w-full">
  <input
    type="text"
    name="native"
    value={formData.native}
    onChange={(e) =>
      handleChange({
        target: {
          name: 'native',
          value: e.target.value.toUpperCase(),
        },
      })
    }
    placeholder="Native"
    className="input input-bordered w-1/2"
  />

  <input
    type="text"
    name="current"
    value={formData.current}
    onChange={(e) =>
      handleChange({
        target: {
          name: 'current',
          value: e.target.value.toUpperCase(),
        },
      })
    }
    placeholder="Current City"
    className="input input-bordered w-1/2"
  />
</div>



        {formData.members.map((member, index) => (
          <MemberForm
            key={index}
            index={index}
            member={member}
            onChange={handleChange}
            onRemove={removeMember}
            isPrimary={index === 0 && member.userId === user?.uid}
            canRemove={isAdminOrCommittee || formData.members.length > 1}
            isSelf={member.userId === user?.uid}
          />
        ))}

        <button type="button" onClick={addMember} className="text-blue-600 hover:text-blue-800 font-medium">
          Add Another Member
        </button>

        <div className="pt-4">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {id ? 'Update Family' : 'Save Family'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyForm;
