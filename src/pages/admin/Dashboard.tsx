import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <p className="text-gray-600 mb-4">Manage product categories</p>
          <Link 
            to="/admin/categories"
            className="text-blue-600 hover:underline"
          >
            Manage Categories →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Shops</h2>
          <p className="text-gray-600 mb-4">Manage shop approvals and details</p>
          <Link 
            to="/admin/shops"
            className="text-blue-600 hover:underline"
          >
            Manage Shops →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <p className="text-gray-600 mb-4">Manage user accounts</p>
          <Link 
            to="/admin/users"
            className="text-blue-600 hover:underline"
          >
            Manage Users →
          </Link>
        </div>
      </div>
    </div>
  );
} 