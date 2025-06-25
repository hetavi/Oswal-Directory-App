import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, role, needsFamilyLinking } = useAuth();
  const navigate = useNavigate();
  const [showStorage, setShowStorage] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-gradient-to-r from-blue-50 to-teal-100 text-gray-800">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-blue-700">
          Dashboard
        </h1>

        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 mb-8">
          {user ? (
            <div className="text-center md:text-left">
              <p className="text-lg font-medium mb-2">
                Welcome, <span className="font-semibold">{user.name || "User"}</span>!
              </p>
              <p className="text-base text-gray-700 mb-1">
                You are logged in as <span className="capitalize font-semibold">{role}</span>.
              </p>
              {needsFamilyLinking && (
                <div className="mt-4 text-red-600 font-medium">
                  ⚠️ Your account needs to be linked to a family profile.
                  <br />
                  <span className="text-sm text-gray-600">
                    Please contact an administrator or update your family info.
                  </span>
                </div>
              )}
          <p className="text-sm text-gray-600 mt-4">
  તમે હવે તમારી ફેમિલીની વિગતો મેનેજ કરી શકો છો.{' '}  {user.familyId && (
    <span
      onClick={() => navigate(`/families/edit/${user.familyId}`)}
      className="text-blue-600 hover:underline cursor-pointer font-medium"
    >
      અહીં ક્લિક કરો
    </span>)}
</p>

            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg mb-2">After sign in, you can:</p>
              <ul className="text-left list-disc list-inside mb-4 space-y-1">
                <li>Add your personal/family details</li>
                <li>Edit your existing information</li>
                <li>View other approved members</li>
              </ul>
              <p className="text-sm italic">
                All submissions require admin approval.
                <br />
                <span className="block mt-1">બધી સબમિશન એડમિન મંજૂરી પછી જ દેખાશે. કમ્યુનિટી અપડેટ રાખવા બદલ આભાર!</span>
              </p>
            </div>
          )}
        </div>

        <div className="text-center space-y-4">
          {user ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Go to Profile
              </button>

              {/* ✅ New Edit Family Button */}
              {user.familyId && (
                <button
                  onClick={() => navigate(`/families/edit/${user.familyId}`)}
                  className="bg-yellow-500 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-yellow-600 transition"
                >
                  Edit Family Details
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate("/signin")}
              className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Sign In / સાઇન ઇન
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
