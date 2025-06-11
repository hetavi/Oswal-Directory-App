// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import TopNavBar from './components/TopNavBar';
import Dashboard from './pages/Dashboard';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import FamilyDirectory from './pages/FamilyDirectory';
import MemberRequests from './pages/MemberRequests';
import CommitteeRequests from './pages/CommitteeRequests';
import UserRoleMaster from './pages/UserRoleMaster';

const App = () => {
  const { user, role, loading } = useAuth();

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white">
        <TopNavBar />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />

            {/* Member+ Access */}
            <Route path="/directory" element={['member', 'committee', 'admin'].includes(role) ? <FamilyDirectory /> : <Navigate to="/" />} />

            {/* Committee Access */}
            <Route path="/member-requests" element={role === 'committee' ? <MemberRequests /> : <Navigate to="/" />} />

            {/* Admin Access */}
            <Route path="/committee-requests" element={role === 'admin' ? <CommitteeRequests /> : <Navigate to="/" />} />
            <Route path="/role-master" element={role === 'admin' ? <UserRoleMaster /> : <Navigate to="/" />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
