import React, { useState, useEffect } from 'react';
import { ref, set, push, update, get } from 'firebase/database';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const FamilyForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initialFormData = {
    native: '',
    current: '',
    members: [{
      name: user?.name || '',
      mobile: user?.mobile || '',
      birthday: '',
      mStatus: '',
      sex: '',
      edu: '',
      job: '',
      others: '',
      role: 'family_head',
      userId: user?.uid || null
    }]
  };

  const [formData, setFormData] = useState(initialFormData);

  // Load data if in edit mode
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
    const updatedMembers = [...formData.members];
    
    if (name === 'native' || name === 'current') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      updatedMembers[index] = { ...updatedMembers[index], [name]: value };
      setFormData(prev => ({ ...prev, members: updatedMembers }));
    }
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [
        ...prev.members,
        {
          name: '',
          mobile: '',
          birthday: '',
          mStatus: '',
          sex: '',
          edu: '',
          job: '',
          others: '',
          role: 'family_member'
        }
      ]
    }));
  };

  const removeMember = (index) => {
    if (formData.members.length <= 1) return;
    const updatedMembers = [...formData.members];
    updatedMembers.splice(index, 1);
    setFormData(prev => ({ ...prev, members: updatedMembers }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (id) {
        // Update existing family
        await update(ref(db, `families/${id}`), formData);
      } else {
        // Create new family
        const newFamilyRef = push(ref(db, 'families'));
        await set(newFamilyRef, {
          ...formData,
          id: newFamilyRef.key,
          createdAt: new Date().toISOString()
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

  if (loading && id) return <div>Loading family data...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        {id ? 'Edit Family' : 'Add New Family'}
      </h2>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Native/Current Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Native Place*</label>
            <input
              type="text"
              name="native"
              value={formData.native}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Current City*</label>
            <input
              type="text"
              name="current"
              value={formData.current}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Members Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Family Members</h3>
          
          {formData.members.map((member, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-3">
              {index === 0 && (
                <p className="text-sm text-gray-500 mb-2">
                  Primary Member (your profile data)
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Name, Mobile, Birthday */}
                <div>
                  <label className="block mb-1 text-sm font-medium">Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={member.name}
                    onChange={(e) => handleChange(e, index)}
                    required
                    disabled={index === 0}
                    className="w-full p-2 border rounded disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Mobile*</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={member.mobile}
                    onChange={(e) => handleChange(e, index)}
                    required
                    disabled={index === 0}
                    className="w-full p-2 border rounded disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Birthdate*</label>
                  <input
                    type="date"
                    name="birthday"
                    value={member.birthday}
                    onChange={(e) => handleChange(e, index)}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Sex, Marital Status, Education, Job */}
                <div>
                  <label className="block mb-1 text-sm font-medium">Gender*</label>
                  <select
                    name="sex"
                    value={member.sex}
                    onChange={(e) => handleChange(e, index)}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Marital Status</label>
                  <select
                    name="mStatus"
                    value={member.mStatus}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Education</label>
                  <input
                    type="text"
                    name="edu"
                    value={member.edu}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Occupation</label>
                  <input
                    type="text"
                    name="job"
                    value={member.job}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <label className="block mb-1 text-sm font-medium">Additional Info</label>
                <textarea
                  name="others"
                  value={member.others}
                  onChange={(e) => handleChange(e, index)}
                  className="w-full p-2 border rounded"
                  rows="2"
                />
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="mt-2 text-red-500 text-sm hover:underline"
                >
                  Remove Member
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addMember}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Another Member
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/families')}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Saving...' : 'Save Family'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyForm;