import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  UserPlus, 
  LogIn, 
  LogOut, 
  Bell,
  UserCheck 
} from 'lucide-react';

const TopNavBar = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Common link style
  const linkStyle = "flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors";

  return (
    <nav className="bg-white shadow px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Home Link - Always visible */}
        <Link to="/" className="flex items-center gap-2">
          <Home className="text-blue-600" size={20} />
          <h1 className="text-lg font-bold text-blue-600">OSWAL</h1>
        </Link>

        {/* Navigation Links - Horizontal on all screens */}
        <div className="flex items-center gap-4 md:gap-6">
          {role === 'guest' && (
            <>
              <Link to="/register" className={linkStyle}>
                <UserPlus size={18} />
                <span className="hidden sm:inline">Register</span>
              </Link>
              <Link to="/login" className={linkStyle}>
                <LogIn size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </>
          )}

          {(role === 'member' || role === 'committee' || role === 'admin') && (
            <>
              <Link to="/families" className={linkStyle}>
                <span className="hidden sm:inline">Directory</span>
                <span className="sm:hidden">Dir</span>
              </Link>
              
              {role === 'member' && (
                <Link to="/request-committee" className={linkStyle}>
                  <UserCheck size={18} />
                  <span className="hidden sm:inline">Become Committee</span>
                </Link>
              )}

              {(role === 'committee' || role === 'admin') && (
                <Link 
                  to={role === 'committee' ? '/member-requests' : '/committee-requests'} 
                  className={linkStyle}
                >
                  <Bell size={18} />
                  <span className="hidden sm:inline">Notifications</span>
                </Link>
              )}

              {role === 'admin' && (
                <Link to="/role-master" className={linkStyle}>
                  <span className="hidden sm:inline">Pending</span>
                  <span className="sm:hidden">Pendings</span>
                </Link>
              )}

              <button onClick={handleLogout} className={linkStyle}>
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;