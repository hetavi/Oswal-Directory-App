import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-4">
        <p>Welcome, {user?.email}</p>
        {/* Add admin-specific components here */}
      </div>
    </div>
  );
}