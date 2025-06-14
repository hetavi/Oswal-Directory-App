import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import FamilyDirectory from '../pages/FamilyDirectory';
import FamiliesPage from '../pages/FamiliesPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import MemberRequests from '../pages/MemberRequests';
import CommitteeRequests from '../pages/CommitteeRequests';
import UserRoleMaster from '../pages/UserRoleMaster';
import LoadingSpinner from '../components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Member+ routes */}
      <Route 
        path="/directory" 
        element={
          <ProtectedRoute allowedRoles={['member', 'committee', 'admin']}>
            <FamilyDirectory />
          </ProtectedRoute>
        } 
      />

      {/* Committee routes */}
      <Route 
        path="/member-requests" 
        element={
          <ProtectedRoute allowedRoles={['committee', 'admin']}>
            <MemberRequests />
          </ProtectedRoute>
        } 
      />
      <Route path="/families/*" 
      element={ <ProtectedRoute allowedRoles={['member','committee', 'admin']}>
      <FamiliesPage /> 
    </ProtectedRoute>} 
    /> 

      {/* Admin routes */}
      <Route 
        path="/committee-requests" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CommitteeRequests />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/role-master" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserRoleMaster />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}