import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../../firebase';
import { Phone, MessageSquare } from 'lucide-react';

const InviteFamilies = () => {
  const [inviteList, setInviteList] = useState([]);

  const fetchFamilies = async () => {
    const snap = await get(ref(db, 'families'));
    if (snap.exists()) {
      const data = snap.val();
      const list = Object.values(data).map(f => {
        const member = f.members?.[0] || {};
        return {
          id: f.id,
          pin: f.pin,
          name: member.name,
          mobile: member.mobile
        };
      });
      setInviteList(list);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Invite Families</h2>
      <div className="space-y-4">
        {inviteList.map((f, i) => (
          <div key={i} className="flex justify-between items-center p-2 bg-white rounded shadow">
            <div>
              <div className="font-semibold">{f.name}</div>
              <div className="text-sm text-gray-600">PIN: {f.pin}</div>
            </div>
            <div className="flex gap-2 items-center">
              <a href={`tel:${f.mobile}`}><Phone className="text-green-600" /></a>
              <a
                href={`https://wa.me/91${f.mobile}?text=${encodeURIComponent(
                  `Hi ${f.name}, your family record is ready. View or update here: https://yourapp.com/families/edit/${f.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="text-green-500" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviteFamilies;
