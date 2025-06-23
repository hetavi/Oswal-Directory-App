import React from 'react';
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
  User,
  BookOpen,
  Users,
} from 'lucide-react';

const TopNavBar = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const getShortName = () => {
    const base = user?.displayName || user?.email || '';
    return base.slice(0, 4).toUpperCase();
  };

  return (
    <nav className="bg-white shadow px-4 py-3 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Home className="text-blue-600" size={20} />
          <h1 className="text-lg font-bold text-blue-600">OSWAL</h1>
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Always visible links */}
         
          <Link to="/families" className={linkStyle('/families')}>
            
            <span className="sm:inline">Dir</span>
          </Link>
          <Link to="/about" className={linkStyle('/about')}>
           
            <span className="sm:inline">About Us</span>
          </Link>

          {/* Show if user is logged in */}
          {user ? (
            <>
              {/* Show 'Pending' for committee or admin */}
              {(role === 'admin' || role === 'committee') && (
                <Link to="/role-master" className={linkStyle('/role-master')}>
                
                  <span className=" sm:inline">role</span>
                </Link>
              )}

              {/* Profile icon and label */}
              <Link to="/profile" className={linkStyle('/profile')}>
               
                <span className="sm:inline">Me</span>
              </Link>

              {/* Display user initials if no photo */}
              {!user.photoURL && (
                <div
                  className="w-8 h-8 rounded-full bg-gray-200 text-sm font-semibold text-gray-600 flex items-center justify-center"
                  title={user.displayName || user.email}
                >
                  {getShortName()}
                </div>
              )}

              {/* Logout icon as last item */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Guest links */}
              <Link to="/register" className={linkStyle('/register')}>
                <UserPlus size={18} />
                <span className="hidden sm:inline">Signup</span>
              </Link>
              <Link to="/login" className={linkStyle('/login')}>
                <LogIn size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
