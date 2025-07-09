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
import Profile from '../pages/UserProfilePage';
import FamilyAddAndInvite from '../components/families/InviteFamilies';
import AddFamilies from '../components/families/AddFamilies';

// ✅ Buy & Sell pages
import BuySellListPage from '../pages/BuySell/BuySellListPage';
import ProductFormPage from '../pages/BuySell/ProductFormPage';
import MyProductsPage from '../pages/BuySell/MyProductsPage';
import ProductDetailPage from '../pages/BuySell/ProductDetailPage';

// 🔒 Protected route wrapper
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

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* 🌐 Public Routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/invite" element={<FamilyAddAndInvite />} />
      <Route path="/addfamilies" element={<AddFamilies />} />

      {/* 👥 Member+ Routes */}
      <Route path="/directory" element={<FamilyDirectory />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/families/*" element={<FamiliesPage />} />

      {/* 🧑‍⚖️ Committee Routes */}
      <Route
        path="/member-requests"
        element={
          <ProtectedRoute allowedRoles={['committee', 'admin']}>
            <MemberRequests />
          </ProtectedRoute>
        }
      />

      {/* 🛠 Admin-only Routes */}
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

      {/* 🛒 Buy & Sell Feature (Member+ only) */}
      <Route
        path="/buy-sell"
        element={
          <ProtectedRoute allowedRoles={['member', 'committee', 'admin']}>
            <BuySellListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buy-sell/new"
        element={
          <ProtectedRoute allowedRoles={['member', 'committee', 'admin']}>
            <ProductFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buy-sell/my"
        element={
          <ProtectedRoute allowedRoles={['member', 'committee', 'admin']}>
            <MyProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buy-sell/:productId"
        element={
          <ProtectedRoute allowedRoles={['member', 'committee', 'admin']}>
            <ProductDetailPage />
          </ProtectedRoute>
        }
      />

      {/* 🚫 Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
