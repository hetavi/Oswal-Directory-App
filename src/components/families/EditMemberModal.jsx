import React from 'react';

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

export default EditMemberModal;
