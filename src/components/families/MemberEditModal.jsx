import React from 'react';

const EditMemberModal = ({ member, onChange, onClose, index }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Member</h3>
        
        <input
          type="text"
          value={member.name}
          onChange={(e) => onChange('name', e.target.value, index)}
          className="w-full p-2 border mb-3"
          placeholder="Name"
        />
        {/* Add similar inputs for mobile, birthday, etc. */}
        
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="border px-4 py-2">Cancel</button>
          <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditMemberModal;
