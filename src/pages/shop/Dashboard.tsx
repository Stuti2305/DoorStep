import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import {
  collection, query, where, getDocs, orderBy,
  limit, doc, onSnapshot, Timestamp,
  startAfter, startAt, limitToLast, documentId
} from 'firebase/firestore';
import {
  ShoppingBag, Package, TrendingUp, DollarSign,
  Calendar, CheckCircle, Clock, ChevronRight,
  PlusCircle, Settings, Bell, Menu, Search, User,
  AlertTriangle, ChevronDown, Truck, Store, X, LogOut,
  ArrowUpRight, BarChart3, CircleDollarSign, Wallet,
  ArrowDown, ArrowUp, CreditCard, Filter, Download,
  ChevronLeft, MoreHorizontal, ListFilter, MapPin
} from 'lucide-react';
import type { Shop, Order, Product } from '../../types/types';

// Card components
const StatCard = ({
  title,
  value,
  icon,
  change,
  trend,
  description
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  description?: string;
}) => {
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-gray-500';
  const trendIcon = trend === 'up' ? <ArrowUp className="w-4 h-4" /> : trend === 'down' ? <ArrowDown className="w-4 h-4" /> : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className="text-gray-500 mb-2">{title}</div>
        <div className="rounded-lg p-2 bg-gray-50">{icon}</div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        {change !== 0 && (
          <div className="flex items-center mt-1">
            <span className={`flex items-center text-sm font-medium ${trendColor}`}>
              {trendIcon}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">{description || 'vs previous period'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// DeliveryPartner component
const DeliveryPartnerInfo = ({ partnerName, distance, status }) => {
  return (
    <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
        <User className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{partnerName}</div>
        <div className="flex items-center text-xs text-gray-500">
          <MapPin className="h-3 w-3 mr-1" />
          {distance} away
        </div>
      </div>
      <div className="ml-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {status}
        </span>
      </div>
    </div>
  );
};

const OrderRow = ({
  order,
  formatCurrency,
  formatDate,
  handleViewOrder
}: {
  order: Order;
  formatCurrency: (amount: number) => string;
  formatDate: (timestamp: number) => string;
  handleViewOrder: (orderId: string) => void;
}) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'assigned':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'processing':
        return <Truck className="w-3 h-3" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3" />;
      case 'cancelled':
        return <X className="w-3 h-3" />;
      case 'assigned':
        return <User className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">#{order.orderId || order.id.slice(0, 8)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User className="h-4 w-4" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{order.name || "Ginny Miller"}</div>
            <div className="text-xs text-gray-500">{order.phone || "+91 98765 43210"}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount || 0)}</div>
        <div className="text-xs text-gray-500">{order.items ? order.items.length : 0} items</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="ml-1 capitalize">{order.status}</span>
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(order.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <button
          onClick={() => handleViewOrder(order.id)}
          className="inline-flex items-center text-blue-600 hover:text-blue-900"
        >
          View
          <ChevronRight className="ml-1 w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

// Main Dashboard Component
export default function ShopDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState < Shop | null > (null);
  const [recentOrders, setRecentOrders] = useState < Order[] > ([]);
  const [products, setProducts] = useState < Product[] > ([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [timeframe, setTimeframe] = useState < 'today' | 'week' | 'month' > ('week');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New order received',
      message: 'Order #order_et1301o1k needs to be processed',
      time: '10 min ago',
      icon: <Package className="h-5 w-5 text-blue-600" />,
      read: false
    },
    {
      id: '2',
      title: 'Low inventory alert',
      message: 'Trimax pen is running low on stock (2 left)',
      time: '1 hour ago',
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      read: false
    },
    {
      id: '3',
      title: 'Delivery partner assigned',
      message: 'Rahul Kumar has been assigned to order #order_et1301o1k',
      time: '5 min ago',
      icon: <User className="h-5 w-5 text-green-600" />,
      read: false
    }
  ]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    salesGrowth: 0,
    orderGrowth: 0,
    topSellingProducts: [] as { id: string, name: string, sold: number, revenue: number, image?: string }[],
    revenueData: [] as { date: string, amount: number }[],
    salesByCategory: [] as { category: string, sales: number }[]
  });

  // Dummy data for when Firebase fetch fails
  const dummyOrder = {
    id: 'dumm123456',
    orderId: 'order_et1301o1k',
    name: 'Ginny Miller',
    phone: '+91 98765 43210',
    status: 'processing' as 'pending' | 'processing' | 'delivered' | 'cancelled',
    totalAmount: 80,
    createdAt: new Date('April 16, 2025 22:57:35').getTime(),
    shopId: 'WBmEo82WJCgWqmwyaLWX6qy8eDW2',
    shopOwnerId: 'WBmEo82WJCgWqmwyaLWX6qy8eDW2',
    userId: 'lG6alW2qDzMB8NMu68MGw92C2V92',
    items: [
      {
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/fooddelivery-student.firebasestorage.app/o/products%2FWBmEo82WJCgWqmwyaLWX6qy8eDW2%2Ftrimax.png?alt=media&token=20ee2f33-8ed5-48e1-bb8f-87008a4e0a6f",
        name: "Trimax pen",
        price: 35,
        productId: "RWEdjXycgGxJGaq8QAFB",
        quantity: 2,
        shopId: "WBmEo82WJCgWqmwyaLWX6qy8eDW2"
      }
    ],
    deliveryPartner: {
        name: "Rahul Kumar",
        phone: "+91 87654 32109",
        vehicleType: "Motorcycle",
        vehicleNumber: "DL 5S AB 1234",
        distance: 1.2,
        status: "En route",
        estimatedArrival: new Date(Date.now() + 5 * 60 * 1000)
      }
  };

  const dummyProducts = [
    {
      id: 'RWEdjXycgGxJGaq8QAFB',
      name: 'Trimax pen',
      price: 35,
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/fooddelivery-student.firebasestorage.app/o/products%2FWBmEo82WJCgWqmwyaLWX6qy8eDW2%2Ftrimax.png?alt=media&token=20ee2f33-8ed5-48e1-bb8f-87008a4e0a6f",
      category: 'Stationery',
      sold: Number(24),
      createdAt: new Date('March 25, 2025').getTime(),
      shopId: 'WBmEo82WJCgWqmwyaLWX6qy8eDW2',
      description: 'Smooth writing premium pen',
      available: true,
      updatedAt: new Date('March 25, 2025').getTime()
    },
    {
      id: 'prod12345',
      name: 'Notebook (Premium)',
      price: 120,
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/fooddelivery-student.firebasestorage.app/o/products%2Fnotebook.jpg?alt=media",
      category: 'Stationery',
      sold: 18,
      createdAt: new Date('March 15, 2025').getTime(),
      shopId: 'WBmEo82WJCgWqmwyaLWX6qy8eDW2',
      description: 'High-quality premium notebook with 200 pages',
      available: true,
      updatedAt: new Date('March 15, 2025').getTime()
    },
    {
      id: 'prod12346',
      name: 'Highlighter Set',
      price: 90,
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/fooddelivery-student.firebasestorage.app/o/products%2Fhighlighter.jpg?alt=media",
      category: 'Stationery',
      sold: 12,
      createdAt: new Date('March 20, 2025').getTime(),
      shopId: 'WBmEo82WJCgWqmwyaLWX6qy8eDW2',
      description: 'Set of 5 vibrant highlighter pens',
      available: true,
      updatedAt: new Date('March 20, 2025').getTime()
    }
  ] as Product[];

  // Dynamic data loading
  useEffect(() => {
    let unsubscribeOrders: () => void = () => {};
    let unsubscribeProducts: () => void = () => {};
    let unsubscribeShop: () => void = () => {};

    const fetchShopData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch shop details
        const shopQuery = query(
          collection(db, 'shops'),
          where('ownerId', '==', user.uid)
        );
        const shopSnapshot = await getDocs(shopQuery);

        if (shopSnapshot.empty) {
          console.log('No shop found for this user');
          setLoading(false);
          return;
        }

        const shopDoc = shopSnapshot.docs[0];
        const shopId = shopDoc.id;
        const shopData = { id: shopId, ...shopDoc.data() } as Shop;
        console.log('Shop Data:', shopData);
        setShop(shopData);

        // Set up real-time listener for the shop
        unsubscribeShop = onSnapshot(doc(db, 'shops', shopId), (doc) => {
          if (doc.exists()) {
            setShop({ id: doc.id, ...doc.data() } as Shop);
          }
        });

        try {
          // Attempt to fetch real orders
          const ordersQuery = query(
            collection(db, 'orders'),
            where('shopId', '==', shopId),
            orderBy('createdAt', 'desc'),
            limit(10)
          );

          const ordersSnapshot = await getDocs(ordersQuery);

          if (ordersSnapshot.empty) {
            console.log('No orders found, using dummy data');
            setRecentOrders([dummyOrder]);
            setProducts(dummyProducts);
            calculateStats([dummyOrder], dummyProducts, shopId);
            setLoading(false);
            return;
          }

          const orders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Order[];

          setRecentOrders(orders);

          // Fetch products
          const productsQuery = query(
            collection(db, 'products'),
            where('shopId', '==', shopId),
            orderBy('createdAt', 'desc')
          );

          const productsSnapshot = await getDocs(productsQuery);

          if (productsSnapshot.empty) {
            console.log('No products found, using dummy data');
            setProducts(dummyProducts);
            calculateStats(orders, dummyProducts, shopId);
            setLoading(false);
            return;
          }

          const products = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];

          setProducts(products);
          calculateStats(orders, products, shopId);

        } catch (error) {
          console.error('Error fetching data:', error);
          console.log('Using dummy data instead');
          setRecentOrders([dummyOrder]);
          setProducts(dummyProducts);
          calculateStats([dummyOrder], dummyProducts, shopId);
        }

        setLoading(false);

      } catch (error) {
        console.error('Error fetching shop data:', error);
        setLoading(false);
      }
    };

    fetchShopData();

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeShop) unsubscribeShop();
    };
  }, [user]);

  // Advanced stats calculation with comparative metrics
  const calculateStats = (orders: Order[], productsList: Product[], shopId: string) => {
    const now = new Date();
    const filteredOrders = filterOrdersByTimeframe(orders, timeframe);

    // Calculate current period stats
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((acc, order) =>
      acc + (order.totalAmount || 0), 0);
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // For dummy data, let's create simulated growth
    const salesGrowth = 12.5; // 12.5% growth
    const orderGrowth = 8.2; // 8.2% growth

    // Calculate top selling products with revenue
    const productSaleMap = new Map();

    // First populate from order data
    filteredOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const current = productSaleMap.get(item.productId) || {
            id: item.productId,
            name: item.name,
            sold: 0,
            revenue: 0,
            image: item.imageUrl
          };
          current.sold += item.quantity;
          current.revenue += (item.price * item.quantity);
          productSaleMap.set(item.productId, current);
        });
      }
    });

    // If we don't have enough data from orders, add from products
    if (productSaleMap.size < 5 && productsList.length > 0) {
      productsList.forEach(product => {
        if (!productSaleMap.has(product.id)) {
          const dummySales = Math.floor(Math.random() * 15) + 5; // 5-20 sales
          productSaleMap.set(product.id, {
            id: product.id,
            name: product.name,
            sold: dummySales,
            revenue: dummySales * product.price,
            image: product.imageUrl
          });
        }
      });
    }

    const topSellingProducts = Array.from(productSaleMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Generate revenue data for chart by day
    const revenueData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Generate some realistic revenue between 2000-8000
      const amount = Math.floor(Math.random() * 6000) + 2000;
      revenueData.push({ date: dateStr, amount });
    }

    // Calculate sales by category
    const categoryMap = new Map();

    // First try to get categories from orders
    filteredOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const product = productsList.find(p => p.id === item.productId);
          const category = product?.category || 'Uncategorized';
          const current = categoryMap.get(category) || 0;
          categoryMap.set(category, current + (item.price * item.quantity));
        });
      }
    });

    // If not enough categories, add from products
    if (categoryMap.size < 3 && productsList.length > 0) {
      const categories = [...new Set(productsList.map(p => p.category || 'Uncategorized'))];
      categories.forEach(category => {
        if (!categoryMap.has(category)) {
          const dummySales = Math.floor(Math.random() * 5000) + 2000;
          categoryMap.set(category, dummySales);
        }
      });
    }

    const salesByCategory = Array.from(categoryMap.entries())
      .map(([category, sales]) => ({ category, sales }))
      .sort((a, b) => b.sales - a.sales);

    setStats({
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalProducts: productsList.length,
      avgOrderValue,
      salesGrowth,
      orderGrowth,
      topSellingProducts,
      revenueData,
      salesByCategory
    });
  };

  const filterOrdersByTimeframe = (orders: Order[], timeframe: 'today' | 'week' | 'month') => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return orders.filter(order => {
      const timestamp = order.createdAt;

      if (timeframe === 'today') {
        return timestamp >= startOfToday;
      } else if (timeframe === 'week') {
        // Past 7 days
        const weekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
        return timestamp >= weekAgo;
      } else {
        // Past 30 days
        const monthAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000);
        return timestamp >= monthAgo;
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSignOut = () => {
    // Your sign-out logic here
    navigate('/login');
  };

  const handleViewOrder = (orderId: string) => {
    const order = recentOrders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowOrderDetails(true);
    } else {
      navigate(`/shop/orders/${orderId}`);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  // Stats memoization for performance
  const memoizedStats = useMemo(() => {
    return {
      revenue: formatCurrency(stats.totalRevenue),
      orders: stats.totalOrders,
      averageOrder: formatCurrency(stats.avgOrderValue),
      pendingOrders: stats.pendingOrders
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">No Shop Found</h1>
          <p className="text-gray-600 mb-8">
            You don't have a shop associated with your account. Create one to start selling products.
          </p>
          <Link
            to="/shop/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-150 w-full"
          >
            <Store className="w-5 h-5" />
            Create Your Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white mr-2">
                  <Store className="h-5 w-5" />
                </div>
                <span className="font-semibold text-gray-900">{shop.name}</span>
              </div>
            </div>
            <div className="hidden md:block flex-1 max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders, products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-slate-50 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none relative"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      <button className="text-xs text-blue-600 hover:text-blue-800">Mark all as read</button>
                    </div>
                    <div className="py-1 max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                              {notification.icon}
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 flex items-center">
                                {notification.title}
                                {!notification.read && (
                                  <span className="ml-2 h-2 w-2 rounded-full bg-blue-600"></span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-gray-100 text-center">
                      <button className="text-xs text-blue-600 hover:text-blue-800">View all notifications</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 text-gray-700 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User className="h-5 w-5" />
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {profileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <Link to="/shop/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Your Profile
                      </Link>
                      <Link to="/shop/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`lg:block fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
          <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200">
            <div className="text-xl font-semibold text-blue-600">StoreFront</div>
          </div>
          <div className="overflow-y-auto h-full">
            <nav className="mt-5 px-2 space-y-1">
              <Link to="/shop/dashboard" className="flex items-center px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                <BarChart3 className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <Link to="/shop/orders" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <Package className="mr-3 h-5 w-5" />
                Orders
                {stats.pendingOrders > 0 && (
                  <span className="ml-auto bg-amber-50 text-amber-700 text-xs py-1 px-2 rounded-full">
                    {stats.pendingOrders} new
                  </span>
                )}
              </Link>
              <Link to="/shop/products" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <Store className="mr-3 h-5 w-5" />
                Products
              </Link>
              <Link to="/shop/deliveries" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <Truck className="mr-3 h-5 w-5" />
                Delivery Partners
              </Link>
              <Link to="/shop/reports" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <TrendingUp className="mr-3 h-5 w-5" />
                Reports
              </Link>
              <Link to="/shop/settings" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </nav>
            <div className="px-4 mt-10">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Upgrade to Pro</h3>
                    <p className="text-xs text-gray-500 mt-1">Get premium features</p>
                  </div>
                </div>
                <button className="mt-3 w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:ml-64">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            {/* Dashboard Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex items-center space-x-3">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex">
                    <button
                      className={`px-3 py-1 text-sm rounded-md ${timeframe === 'today' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                      onClick={() => setTimeframe('today')}
                    >
                      Today
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-md ${timeframe === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                      onClick={() => setTimeframe('week')}
                    >
                      Week
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-md ${timeframe === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                      onClick={() => setTimeframe('month')}
                    >
                      Month
                    </button>
                  </div>
                  <button className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-gray-500 hover:text-gray-700">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard
                title="Total Revenue"
                value={memoizedStats.revenue}
                icon={<CircleDollarSign className="h-5 w-5 text-blue-600" />}
                change={stats.salesGrowth}
                trend="up"
              />
              <StatCard
                title="Orders"
                value={memoizedStats.orders}
                icon={<Package className="h-5 w-5 text-emerald-600" />}
                change={stats.orderGrowth}
                trend="up"
              />
              <StatCard
                title="Average Order Value"
                value={memoizedStats.averageOrder}
                icon={<CreditCard className="h-5 w-5 text-amber-600" />}
                change={2.1}
                trend="up"
              />
              <StatCard
                title="Pending Orders"
                value={memoizedStats.pendingOrders}
                icon={<Clock className="h-5 w-5 text-rose-600" />}
                change={0}
                trend="neutral"
                description="awaiting action"
              />
            </div>

            {/* Recent Orders and Delivery Partners */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
                    <Link to="/shop/orders" className="text-sm text-blue-600 hover:text-blue-900 flex items-center">
                      View all
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                          <OrderRow
                            key={order.id}
                            order={order}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            handleViewOrder={handleViewOrder}
                          />
                        ))
                      ) : (
                        // If no orders found, show dummy order data
                        <OrderRow
                          key={dummyOrder.id}
                          order={dummyOrder}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                          handleViewOrder={handleViewOrder}
                        />
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery Partners Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Delivery Partners</h2>
                    <Link to="/shop/delivery-partners" className="text-sm text-blue-600 hover:text-blue-900 flex items-center">
                      View all
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Available Partners
                    </div>

                    {/* Delivery Partner Components */}
                    <DeliveryPartnerInfo
                      partnerName="Rahul Kumar"
                      distance="1.2 km"
                      status="Available"
                    />

                    <DeliveryPartnerInfo
                      partnerName="Priya Singh"
                      distance="2.5 km"
                      status="Available"
                    />
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Currently Assigned
                    </div>

                    {/* Assigned Partners */}
                    {recentOrders.filter(order => order.status === 'assigned' && order.deliveryPartner).map((order, index) => (
                      <div key={index} className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 mb-2">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {order.deliveryPartner?.name || "Partner name"}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Order: #{order.orderId || order.id.slice(0, 8)}
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              {typeof order.deliveryPartner?.estimatedArrival === 'object' 
                                ? (order.deliveryPartner?.estimatedArrival as Date).toLocaleString() 
                                : order.deliveryPartner?.estimatedArrival || "En route"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* If no assigned orders are found, show dummy data */}
                    {!recentOrders.some(order => order.status === 'assigned' && order.deliveryPartner) && (
                      <div className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 mb-2">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Rahul Kumar
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Order: #order_et1301o1k
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              5 min away
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button className="mt-4 w-full bg-blue-50 text-blue-600 rounded-lg py-2 text-sm font-medium hover:bg-blue-100 flex items-center justify-center">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Assign Partner to Order
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Top Selling Products</h2>
                  <Link to="/shop/products/analytics" className="text-sm text-blue-600 hover:text-blue-900 flex items-center">
                    View analytics
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sold
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.topSellingProducts.length > 0 ? (
                      stats.topSellingProducts.map((product, index) => {
                        const productDetail = products.find(p => p.id === product.id) || {
                          category: 'Stationery',
                          stock: Math.floor(Math.random() * 20) + 5
                        };

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="h-10 w-10 object-cover rounded"
                                    />
                                  ) : (
                                    <Package className="h-5 w-5 text-gray-500" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{productDetail.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.sold} units</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</div>
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${productDetail.stock < 10 ? 'text-amber-600' : 'text-green-600'}`}>
                                {productDetail.stock} in stock
                              </div>
                            </td> */}
                          </tr>
                        );
                      })
                    ) : (
                      // Use products data as fallback for top sellers
                      products.slice(0, 5).map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-10 w-10 object-cover rounded"
                                  />
                                ) : (
                                  <Package className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{product.category || 'Stationery'}</div>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.sold || Math.floor(Math.random() * 20) + 5} units</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency((product.sold || 10) * product.price)}</div>
                          </td> */}
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${product.stock < 10 ? 'text-amber-600' : 'text-green-600'}`}>
                              {product.stock} in stock
                            </div>
                          </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
              <button onClick={closeOrderDetails} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-sm text-gray-500">Order ID</div>
                  <div className="text-lg font-medium text-gray-900">#{selectedOrder.orderId || selectedOrder.id.slice(0, 8)}</div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedOrder.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                    selectedOrder.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                      selectedOrder.status === 'assigned' ? 'bg-purple-50 text-purple-700' :
                        selectedOrder.status === 'cancelled' ? 'bg-rose-50 text-rose-700' :
                          'bg-amber-50 text-amber-700'
                  }`}>
                  <span className="capitalize">{selectedOrder.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Customer</div>
                  <div className="text-sm font-medium text-gray-900">{selectedOrder.name}</div>
                  <div className="text-sm text-gray-500">{selectedOrder.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Date & Time</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(selectedOrder.createdAt)}
                  </div>
                </div>
              </div>

              {/* Delivery Partner Assignment Section */}
              {selectedOrder.deliveryPartner ? (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">Delivery Partner</div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{selectedOrder.deliveryPartner.name}</div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {selectedOrder.deliveryPartner.distance} away
                          </div>
                          <div className="text-xs text-gray-500">
                            ETA: {typeof selectedOrder.deliveryPartner.estimatedArrival === 'object' 
                              ? (selectedOrder.deliveryPartner.estimatedArrival as Date).toLocaleString() 
                              : selectedOrder.deliveryPartner.estimatedArrival}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">Assign Delivery Partner</div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex flex-col space-y-2">
                      <button className="w-full text-left p-2 flex items-center rounded-lg hover:bg-gray-100">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Rahul Kumar</div>
                          <div className="text-xs text-gray-500">1.2 km away</div>
                        </div>
                        <div className="ml-auto">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        </div>
                      </button>

                      <button className="w-full text-left p-2 flex items-center rounded-lg hover:bg-gray-100">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Priya Singh</div>
                          <div className="text-xs text-gray-500">2.5 km away</div>
                        </div>
                        <div className="ml-auto">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-2">Order Items</div>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center py-3 px-4 border-b border-gray-100 last:border-0">
                      <div className="h-12 w-12 rounded bg-white border border-gray-200 flex items-center justify-center mr-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-12 w-12 object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between py-2">
                  <div className="text-sm text-gray-500">Subtotal</div>
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.totalAmount || 0)}</div>
                </div>
                <div className="flex justify-between py-2">
                  <div className="text-sm text-gray-500">Delivery Fee</div>
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.deliveryFee || 0)}</div>
                </div>
                <div className="flex justify-between py-2 font-medium">
                  <div className="text-sm text-gray-900">Total</div>
                  <div className="text-lg text-gray-900">{formatCurrency((selectedOrder.totalAmount || 0) + (selectedOrder.deliveryFee || 0))}</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  Update Order Status
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}