import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';

const FamilyList = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const familiesRef = ref(db, 'families');
    const unsubscribe = onValue(familiesRef, (snapshot) => {
      const data = snapshot.val();
      const familiesList = data ? Object.values(data) : [];
      setFamilies(familiesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredFamilies = families.filter(family => 
    family.native.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.current.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.members.some(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.mobile && member.mobile.includes(searchTerm))
  ))

  if (loading) return <div className="text-center py-8">Loading families...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Family Directory</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search families..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <Link
            to="/families/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
          >
            Add New Family
          </Link>
        </div>
      </div>

      {filteredFamilies.length === 0 ? (
        <div className="text-center py-8 border rounded">
          {searchTerm ? 'No matching families found' : 'No families registered yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredFamilies.map(family => (
            <div key={family.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    {family.native} → {family.current}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {family.members.length} member{family.members.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  to={`/families/edit/${family.id}`}
                  className="text-blue-600 hover:underline whitespace-nowrap"
                >
                  Edit Family
                </Link>
              </div>

              <div className="space-y-2">
                {family.members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-3 w-full">
                      {/* Call icon - leftmost */}
                      {member.mobile ? (
                        <a 
                          href={`tel:${member.mobile}`} 
                          className="text-xl hover:text-green-600 transition-colors flex-shrink-0"
                          title="Call"
                        >
                          📞
                        </a>
                      ) : (
                        <span className="text-xl text-gray-300 flex-shrink-0">📞</span>
                      )}
                      
                      {/* Member info - middle */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{member.name}</p>
                        {/*member.mobile ? (
                          <p className="text-sm text-gray-600 truncate">{member.mobile}</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No phone number</p>
                        )**/}
                      </div>
                      
                      {/* WhatsApp icon - rightmost */}
                      {member.mobile ? (
                        <a 
                          href={`https://wa.me/${member.mobile}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                          title="WhatsApp"
                        >
                          <img 
                            src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" 
                            alt="WhatsApp" 
                            className="w-5 h-5" 
                          />
                        </a>
                      ) : (
                        <img 
                          src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" 
                          alt="WhatsApp" 
                          className="w-5 h-5 opacity-30 flex-shrink-0" 
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 capitalize ml-2 whitespace-nowrap">
                      {member.sex}{/*, {member.mStatus}*/}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyList;