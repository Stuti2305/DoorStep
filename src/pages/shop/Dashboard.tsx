import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { 
  Store, Package, Clock, TrendingUp, Users, 
  DollarSign, Bell, Settings, Truck, Menu, User,
  ChevronDown, X
} from 'lucide-react';
import type { Shop, Order, Product } from '../../types';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend: string;
  trendDirection?: 'up' | 'down';
}

interface QuickActionProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function ShopDashboard() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!user) return;
      
      try {
        // Fetch shop details
        const shopQuery = query(
          collection(db, 'shops'), 
          where('ownerId', '==', user.uid)
        );
        const shopSnapshot = await getDocs(shopQuery);
        if (!shopSnapshot.empty) {
          setShop({ id: shopSnapshot.docs[0].id, ...shopSnapshot.docs[0].data() } as Shop);
        }

        // Fetch recent orders
        const ordersQuery = query(
          collection(db, 'orders'),
          where('shopId', '==', shopSnapshot.docs[0].id),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        setRecentOrders(ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[]);

        // Fetch products
        const productsQuery = query(
          collection(db, 'products'),
          where('shopId', '==', shopSnapshot.docs[0].id)
        );
        const productsSnapshot = await getDocs(productsQuery);
        setProducts(productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[]);

        // Calculate stats
        const allOrders = await getDocs(query(
          collection(db, 'orders'),
          where('shopId', '==', shopSnapshot.docs[0].id)
        ));

        const calculatedStats = allOrders.docs.reduce((acc, order) => {
          const data = order.data();
          return {
            totalOrders: acc.totalOrders + 1,
            totalRevenue: acc.totalRevenue + data.total,
            pendingOrders: data.status === 'pending' ? acc.pendingOrders + 1 : acc.pendingOrders,
            averageRating: data.rating ? acc.averageRating + data.rating : acc.averageRating,
          };
        }, {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          averageRating: 0,
        });

        setStats({
          ...calculatedStats,
          totalProducts: productsSnapshot.size,
          averageRating: calculatedStats.averageRating / (allOrders.size || 1),
        });

      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [user]);

  const menuItems = [
    { title: 'Add Product', path: '/shop/add-product' },
    { title: 'Add Category', path: '/shop/add-category' },
    { title: 'View Products', path: '/shop/products' },
    { title: 'View Categories', path: '/shop/categories' },
    { title: 'Edit Product', path: '/shop/edit-product' },
    { title: 'Edit Category', path: '/shop/edit-category' },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative"
            >
              {showMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shop?.name}</h1>
              <p className="text-gray-600">Shop Dashboard</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Bell className="w-6 h-6" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <User className="w-6 h-6" />
                <ChevronDown className="w-4 h-4" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/shop/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/shop/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Dropdown */}
        {showMenu && (
          <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 border-b last:border-b-0"
              >
                {item.title}
              </Link>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Package className="w-6 h-6" />}
            title="Total Orders"
            value={stats.totalOrders}
            trend="+12.5%"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toFixed(2)}`}
            trend="+8.2%"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Pending Orders"
            value={stats.pendingOrders}
            trend="-2.4%"
            trendDirection="down"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            trend="+4.8%"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QuickAction
            to="/shop/orders"
            icon={<Package className="w-6 h-6" />}
            title="Manage Orders"
            description="View and process customer orders"
          />
          <QuickAction
            to="/shop/products"
            icon={<Store className="w-6 h-6" />}
            title="Manage Products"
            description="Add, edit, or remove products"
          />
          <QuickAction
            to="/shop/delivery"
            icon={<Truck className="w-6 h-6" />}
            title="Delivery Settings"
            description="Manage delivery options and zones"
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
          <Link
            to="/shop/orders"
            className="mt-4 text-blue-600 hover:text-blue-700 inline-flex items-center"
          >
            View all orders
          </Link>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Link
            to="/shop/products"
            className="mt-4 text-blue-600 hover:text-blue-700 inline-flex items-center"
          >
            View all products
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend, trendDirection = 'up' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
        <span className={`text-sm ${
          trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
        }`}>
          {trend}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function QuickAction({ to, icon, title, description }: QuickActionProps) {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="p-2 bg-blue-50 rounded-lg w-fit mb-4">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <tr className="border-b">
      <td className="py-4">{order.id.slice(0, 8)}</td>
      <td className="py-4">{order.userId}</td>
      <td className="py-4">{order.items.length} items</td>
      <td className="py-4">₹{order.total}</td>
      <td className="py-4">
        <span className={`px-2 py-1 rounded-full text-sm ${
          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status}
        </span>
      </td>
      <td className="py-4">
        <button className="text-blue-600 hover:text-blue-700">
          View Details
        </button>
      </td>
    </tr>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-32 object-cover rounded-lg mb-4"
      />
      <h3 className="font-semibold mb-1">{product.name}</h3>
      <p className="text-gray-600">₹{product.price}</p>
      <div className="mt-2 flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-sm ${
          product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {product.available ? 'In Stock' : 'Out of Stock'}
        </span>
        <button className="text-blue-600 hover:text-blue-700">
          Edit
        </button>
      </div>
    </div>
  );
} 