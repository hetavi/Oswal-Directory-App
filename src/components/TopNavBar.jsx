import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react'; // Make sure `lucide-react` is installed

const TopNavBar = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow px-4 py-3 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap">
        <div className="flex items-center justify-between w-full md:w-auto">
          <h1 className="text-lg font-bold text-blue-600">OSWAL</h1>
          <button
            className="md:hidden text-blue-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className={`w-full md:flex md:items-center md:w-auto ${menuOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
            {role === 'guest' && (
              <>
                <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
                <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
              </>
            )}

            {(role === 'member' || role === 'committee' || role === 'admin') && (
              <>
                <Link to="/directory" className="text-blue-500 hover:underline">Family Directory</Link>
                <button onClick={handleLogout} className="text-red-500 hover:underline">Logout</button>
              </>
            )}

            {role === 'member' && (
              <Link to="/request-committee" className="text-purple-500 hover:underline">Become Committee Member</Link>
            )}

            {role === 'committee' && (
              <Link to="/member-requests" className="text-green-600 hover:underline">Notifications</Link>
            )}

            {role === 'admin' && (
              <>
                <Link to="/committee-requests" className="text-yellow-600 hover:underline">Notifications</Link>
                <Link to="/role-master" className="text-black hover:underline">User & Role Master</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
