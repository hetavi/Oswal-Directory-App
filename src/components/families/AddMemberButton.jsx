import React from 'react';

const AddMemberButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="text-green-600 text-sm mb-4 flex items-center gap-1"
  >
    ➕ Add Member
  </button>
);

export default AddMemberButton;
