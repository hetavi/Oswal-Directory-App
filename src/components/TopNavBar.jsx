import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  UserPlus,
  LogIn,
  LogOut,
  Bell,
  UserCheck,
  User,
} from 'lucide-react';

const TopNavBar = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const linkStyle = (path) =>
    `flex items-center gap-2 transition-colors ${
      location.pathname === path
        ? 'text-blue-600 font-semibold'
        : 'text-gray-700 hover:text-blue-600'
    }`;

  return (
    <nav className="bg-white shadow px-4 py-3 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Home className="text-blue-600" size={20} />
          <h1 className="text-lg font-bold text-blue-600">OSWAL</h1>
        </Link>

        <div className="flex items-center gap-4 md:gap-6">

            <Link to="/families" className={linkStyle('/families')}>
                <span className="hidden sm:inline">Directory</span>
                <span className="sm:hidden">Dir</span>
              </Link>
              <Link to="/profile" className={linkStyle('/profile')}>
                <User size={18} />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              
          {!user ? (
            <> 
            
              <Link to="/register" className={linkStyle('/register')}>
                <UserPlus size={18} />
                <span className="hidden sm:inline">Register</span>
              </Link>
              <Link to="/login" className={linkStyle('/login')}>
                <LogIn size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </>
          ) : (
            <>
           


              {role === 'member' && (
                <Link to="/request-committee" className={linkStyle('/request-committee')}>
                  <UserCheck size={18} />
                  <span className="hidden sm:inline">Become Committee</span>
                </Link>
              )}

              {(role === 'committee' || role === 'admin') && (
                <Link
                  to={role === 'committee' ? '/member-requests' : '/committee-requests'}
                  className={linkStyle(
                    role === 'committee' ? '/member-requests' : '/committee-requests'
                  )}
                >
                  <Bell size={18} />
                  <span className="hidden sm:inline">Notifications</span>
                </Link>
              )}

              {role === 'admin' && (
                <Link to="/role-master" className={linkStyle('/role-master')}>
                  <span className="hidden sm:inline">Pending</span>
                  <span className="sm:hidden">Pendings</span>
                </Link>
              )}

              {/* Dropdown for profile/logout */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="hidden sm:inline font-medium">
                    {user?.displayName || user?.email?.split('@')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
