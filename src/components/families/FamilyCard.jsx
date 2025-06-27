import React from 'react';
import { Link } from 'react-router-dom';

const FamilyCard = ({ family, onMemberEdit, canEdit }) => {
  return (
    <div className="border rounded-xl p-5 shadow-sm bg-white">
      <div className="flex justify-between items-start mb-4">
        
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            <span className="text-blue-600">{family.native}</span> → <span className="text-green-600">{family.current}</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {family.members?.length || 0} member{family.members?.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canEdit && (
          <Link to={`/families/edit/${family.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            ✏️ Edit
          </Link>
        )}
      </div>
      <div className="space-y-2">
        {family.members.map((member, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border hover:shadow">
            <div className="flex items-center gap-3 w-full">
              <a href={`tel:${member.mobile}`} className="text-xl hover:text-green-600">📞</a>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${member.sex === 'male' ? 'text-blue-700' : member.sex === 'Female' ? 'text-pink-600' : 'text-gray-600'}`}>
                  {member.name}
                </p>
              </div>
              {member.mobile ? (
                <a href={`https://wa.me/${member.mobile}`} target="_blank" rel="noopener noreferrer">
                  <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="WhatsApp" className="w-6 h-6" />
                </a>
              ) : (
                <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="WhatsApp" className="w-5 h-5 opacity-30" />
              )}
              {canEdit && (
                <button
                  onClick={() => onMemberEdit(family.id, index)}
                  className="text-xs text-blue-500 hover:text-blue-700 ml-2"
                  title="Edit Member"
                >
                  ✏️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyCard;
