import React from 'react';

const MemberForm = () => {
  return (
    <div className="space-y-3 p-4 bg-white rounded-xl shadow-md">
      <div className="text-lg font-semibold">Family Page</div>

      {/* Name + Sex */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Name"
          className="flex-1 input input-bordered"
        />
        <select className="w-28 select select-bordered">
          <option value="">Sex</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>

      {/* ISD + Mobile */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="ISD"
          defaultValue="+91"
          className="w-20 input input-bordered"
        />
        <input
          type="tel"
          placeholder="Mobile"
          className="flex-1 input input-bordered"
        />
      </div>

      {/* Birth Date + Edu */}
      <div className="flex gap-2">
        <input
          type="date"
          className="flex-1 input input-bordered"
        />
        <input
          type="text"
          placeholder="Education"
          className="flex-1 input input-bordered"
        />
      </div>

      {/* Marital Status */}
      <div className="grid grid-cols-2 gap-2 text-sm text-center">
        {['Single', 'Married', 'Divorced', 'Widow'].map((status) => (
          <button key={status} type="button" className="btn btn-sm border">
            {status}
          </button>
        ))}
      </div>

      {/* Job Type */}
      <div className="grid grid-cols-2 gap-2 text-sm text-center">
        {['Study', 'Business', 'Service', 'N/A'].map((job) => (
          <button key={job} type="button" className="btn btn-sm border">
            {job}
          </button>
        ))}
      </div>

      {/* Business/Service Detail */}
      <textarea
        rows={3}
        placeholder="Business/Service Detail"
        className="w-full textarea textarea-bordered"
      ></textarea>

      {/* Relation with First Member */}
      <input
        type="text"
        placeholder="Relation with Primary Member"
        className="w-full input input-bordered"
      />
    </div>
  );
};

export default MemberForm;
