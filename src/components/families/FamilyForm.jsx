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
console.log('family form')
  // Check if user is admin or committee member
  const isAdminOrCommittee = user?.role === 'admin' || user?.role === 'committee';

  const initialFormData = {
    native: '',
    current: '',
    members: isAdminOrCommittee ? [] : [{
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
          setError('Failed to load family data') ;
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
    const newMember = {
      name: '',
      mobile: '',
      birthday: '',
      mStatus: '',
      sex: '',
      edu: '',
      job: '',
      others: '',
      role: formData.members.length === 0 ? 'family_head' : 'family_member'
    };

    setFormData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  const removeMember = (index) => {
    // Don't allow removal if it's the only member for regular users
    if (!isAdminOrCommittee && formData.members.length <= 1) return;
    
    const updatedMembers = [...formData.members];
    updatedMembers.splice(index, 1);
    setFormData(prev => ({ ...prev, members: updatedMembers }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate at least one member exists
    if (formData.members.length === 0) {
      setError('Please add at least one family member');
      return;
    }

    setLoading(true);
    
    try {
      if (id) {
        // Update existing family
        await update(ref(db, `families/${id}`), {
          ...formData,
          updatedAt: Date.now(),
        });
      } else {
        const isPrivileged = user?.role === 'admin' || user?.role === 'committee';
        const isGuest = user?.role === 'guest';
        
        // Family ID logic
        const familyId = isPrivileged ? push(ref(db, 'families')).key : `fam_${user?.uid}`;
        const newFamilyRef = ref(db, `families/${familyId}`);
        
        // PIN logic
        const pin = isGuest ? '0000' : Math.floor(1000 + Math.random() * 9000).toString();
        
        // Save to Firebase
        await set(newFamilyRef, {
          ...formData,
          id: familyId,
          pin: pin,
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

  if (loading && id) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ... (keep header and error display from your original code) ... */}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
        {/* Native/Current Location Fields */}
        {/* ... (keep existing location fields code) ... */}

        {/* Members Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Family Members</h3>
            {formData.members.length === 0 && (
              <span className="text-sm text-red-500">* At least one member required</span>
            )}
          </div>

          {formData.members.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-gray-50">
              <p className="text-gray-500 mb-4">No members added yet</p>
              <button
                type="button"
                onClick={addMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add First Member
              </button>
            </div>
          ) : (
            formData.members.map((member, index) => (
              <div key={index} className="border border-gray-200 p-6 rounded-xl bg-gray-50 space-y-4">
                {index === 0 && member.userId === user?.uid && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Primary Member (your profile)
                  </div>
                )}

                {/* Member Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={member.name}
                      onChange={(e) => handleChange(e, index)}
                      required
                      disabled={member.userId === user?.uid}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        member.sex === 'Male' ? 'border-blue-200 bg-blue-50' : 
                        member.sex === 'Female' ? 'border-pink-200 bg-pink-50' : 
                        'border-gray-300'
                      } ${member.userId === user?.uid ? 'disabled:bg-gray-100' : ''}`}
                    />
                  </div>
                  
                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile*</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={member.mobile}
                      onChange={(e) => handleChange(e, index)}
                      required
                      disabled={member.userId === user?.uid}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    />
                  </div>
                  
                  {/* Birthday */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate*</label>
                    <input
                      type="date"
                      name="birthday"
                      value={member.birthday}
                      onChange={(e) => handleChange(e, index)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* ... (rest of the member fields - keep your existing code) ... */}

                {/* Only show remove button if:
                     - Not the only member for regular users, or
                     - Any member for admin/committee */}
                {(isAdminOrCommittee || formData.members.length > 1) && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 mt-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Remove Member
                  </button>
                )}
              </div>
            ))
          )}

          <button
            type="button"
            onClick={addMember}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {formData.members.length === 0 ? 'Add First Member' : 'Add Another Member'}
          </button>
        </div>

        {/* Form Actions */}
        {/* ... (keep existing form actions code) ... */}
{/* Submit Button */}
<div className="pt-4">
  <button
    type="submit"
    className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
    disabled={loading}
  >
    {id ? 'Update Family' : 'Save Family'}
  </button>
</div>


      </form>
    </div>
  );
};

export default FamilyForm;