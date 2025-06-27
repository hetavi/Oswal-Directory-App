import React from 'react';

// Utility: Proper Case
const toProperCase = (text) =>
  text
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const MemberForm = ({
  member,
  index,
  onChange,
  onRemove,
  isPrimary = false,
  canRemove = true,
}) => {
  const labelStyle = 'text-xs font-medium text-gray-600';

  return (
    
      <div className="bg-white p-1 rounded-md shadow-sm border border-gray-200 space-y-1 [&_input]:bg-yellow-50 [&_input]:border-blue-300 [&_input]:focus:border-blue-500 [&_input]:focus:ring-blue-200">

      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-800">
          Member {index + 1}{' '}
          {isPrimary && <span className="text-xs text-blue-500">(Primary)</span>}
        </h2>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 text-xs underline"
          >
            Remove
          </button>
        )}
      </div>

      {/* Relation First */}
      <div className="flex items-center gap-2">
  <input
    type="text"
    name="relation"
    value={member.relation}
    onChange={(e) => onChange(e, index)}
    onBlur={(e) =>
      onChange({
        target: {
          name: 'relation',
          value: toProperCase(e.target.value),
        },
      }, index)
    }
    placeholder="Relation with Primary"
    className="input input-sm input-bordered flex-1"
  />
</div>

      {/* Name + Sex */}
      <div className="flex gap-2">
  <div className="w-[70%]">
    <label className={labelStyle}>Full Name</label>
    <input
      type="text"
      name="name"
      value={member.name}
      onChange={(e) => onChange(e, index)}
      onBlur={(e) =>
        onChange({ target: { name: 'name', value: toProperCase(e.target.value) } }, index)
      }
      placeholder="Full Name"
      className="input input-sm input-bordered w-full"
    />
  </div>
  <div className="w-[30%]">
    <label className={labelStyle}>Sex</label>
    <select
      name="sex"
      value={member.sex}
      onChange={(e) => onChange(e, index)}
      className="select select-sm select-bordered w-full"
    >
      <option value="">Select</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select>
  </div>
</div>
 

      {/* ISD + Mobile */}
      <div className="flex gap-2">
  <div className="w-[30%]">
    <label className={labelStyle}>ISD</label>
    <input
      type="text"
      name="isd"
      value={member.isd || '+91'}
      onChange={(e) => onChange(e, index)}
      className="input input-sm input-bordered w-full"
    />
  </div>
  <div className="w-[70%]">
    <label className={labelStyle}>Mobile</label>
    <input
      type="tel"
      name="mobile"
      value={member.mobile}
      onChange={(e) => onChange(e, index)}
      className="input input-sm input-bordered w-full"
    />
  </div>
</div>


      {/* Birthday + Education */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelStyle}>Birth Date</label>
          <input
            type="text"
            name="birthday"
            value={member.birthday}
            onChange={(e) => onChange(e, index)}
            placeholder="DD/MM/YYYY"
            className="input input-sm input-bordered w-full"
          />
        </div>
        <div>
          <label className={labelStyle}>Education</label>
          <input
            type="text"
            name="edu"
            value={member.edu}
            onChange={(e) => onChange(e, index)}
            onBlur={(e) =>
              onChange({ target: { name: 'edu', value: toProperCase(e.target.value) } }, index)
            }
            className="input input-sm input-bordered w-full"
          />
        </div>
      </div>

      {/* Marital Status + Job Type */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelStyle}>Marital Status</label>
          <select
            name="mStatus"
            value={member.mStatus}
            onChange={(e) => onChange(e, index)}
            className="select select-sm select-bordered w-full"
          >
            <option value="">Select</option>
            <option>Single</option>
            <option>Married</option>
            <option>Divorced</option>
            <option>Widow</option>
          </select>
        </div>
        <div>
          <label className={labelStyle}>Job Type</label>
          <select
            name="job"
            value={member.job}
            onChange={(e) => onChange(e, index)}
            className="select select-sm select-bordered w-full"
          >
            <option value="">Select</option>
            <option>Study</option>
            <option>Business</option>
            <option>Service</option>
            <option>N/A</option>
          </select>
        </div>
      </div>

      {/* Business/Service Detail */}
      <div>
        <label className={labelStyle}>Business/Service Detail</label>
        <textarea
          name="others"
          value={member.others}
          onChange={(e) => onChange(e, index)}
          onBlur={(e) =>
            onChange({ target: { name: 'others', value: toProperCase(e.target.value) } }, index)
          }
          rows={2}
          className="textarea textarea-sm textarea-bordered w-full"
        />
      </div>
    </div>
  );
};

export default MemberForm;
