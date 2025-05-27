import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, auth } from '../../lib/firebase';
import {
  collection, query, where, getDocs, orderBy,
  limit, doc, onSnapshot, Timestamp,
  startAfter, startAt, limitToLast, documentId, getDoc
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
import type { Shop, Product } from '../../types/types';

// Add these interfaces at the top of the file
interface RevenueData {
  date: string;
  amount: number;
}

interface SalesByCategory {
  category: string;
  sales: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: React.ReactNode;
  read: boolean;
}

interface Order {
  id: string;
  orderId: string;
  userId: string;
  shopId: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: number;
  statusHistory: any[];
  assignedDeliveryManId?: string | null;
  assignedDeliveryManName?: string | null;
  name?: string | null;
  phone?: string | null;
  distance?: string | null;
  estimatedArrival?: Date | string | null;
  deliveryFee?: number;
}

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
interface DeliveryPartnerInfoProps {
  partnerName: string;
  distance: string;
  status: string;
}

const DeliveryPartnerInfo = ({ partnerName, distance, status }: DeliveryPartnerInfoProps) => {
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
            <div className="text-sm font-medium text-gray-900">
              {order.assignedDeliveryManName || "Not Assigned"}
            </div>
            <div className="text-xs text-gray-500">
              ID: {order.assignedDeliveryManId || "N/A"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</div>
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    totalProducts: number;
    avgOrderValue: number;
    salesGrowth: number;
    orderGrowth: number;
    topSellingProducts: { id: string; name: string; sold: number; revenue: number; image?: string }[];
    revenueData: RevenueData[];
    salesByCategory: SalesByCategory[];
  }>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    salesGrowth: 0,
    orderGrowth: 0,
    topSellingProducts: [],
    revenueData: [],
    salesByCategory: []
  });
  const [deliveryPartners, setDeliveryPartners] = useState<{ id: string; name: string; distance: string; current_duty: string }[]>([]);

  // Define fetchOrders function before the useEffect hooks
  const fetchOrders = () => {
    if (!shop) return;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('shopId', '==', shop.id),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersList: Order[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orderId: data.orderId || doc.id,
          userId: data.userId,
          shopId: data.shopId,
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate().getTime() || new Date().getTime(),
          statusHistory: data.statusHistory || [],
          assignedDeliveryManId: data.assignedDeliveryManId || null,
          assignedDeliveryManName: data.assignedDeliveryManName || null,
          name: data.name || null,
          phone: data.phone || null,
          distance: data.distance || null,
          estimatedArrival: data.estimatedArrival || null,
          deliveryFee: data.deliveryFee || 0
        } as Order;
      });

      setRecentOrders(ordersList);
      calculateStats(ordersList, products, shop.id);
    });

    return unsubscribe;
  };

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
        setShop(shopData);

        // Set up real-time listener for the shop
        unsubscribeShop = onSnapshot(doc(db, 'shops', shopId), (doc) => {
          if (doc.exists()) {
            setShop({ id: doc.id, ...doc.data() } as Shop);
          }
        });

        // Fetch orders
        const fetchOrders = async () => {
          if (!shop) return;

          const ordersQuery = query(
            collection(db, 'orders'),
            where('shopId', '==', shop.id),
            orderBy('createdAt', 'desc'),
            limit(5)
          );

          const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const ordersList: Order[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                orderId: data.orderId || doc.id,
                userId: data.userId,
                shopId: data.shopId,
                items: data.items || [],
                totalAmount: data.totalAmount || 0,
                status: data.status || 'pending',
                createdAt: data.createdAt?.toDate().getTime() || new Date().getTime(),
                statusHistory: data.statusHistory || [],
                assignedDeliveryManId: data.assignedDeliveryManId || null,
                assignedDeliveryManName: data.assignedDeliveryManName || null,
                name: data.name || null,
                phone: data.phone || null,
                distance: data.distance || null,
                estimatedArrival: data.estimatedArrival || null,
                deliveryFee: data.deliveryFee || 0
              } as Order;
            });

            setRecentOrders(ordersList);
            calculateStats(ordersList, products, shop.id);
          });

          return () => unsubscribe();
        };

        fetchOrders();

        // Fetch products
        const productsQuery = query(
          collection(db, 'products'),
          where('shopId', '==', shopId),
          orderBy('createdAt', 'desc')
        );

        const productsSnapshot = await getDocs(productsQuery);
        const products = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];

        setProducts(products);

        // Fetch delivery partners
        const fetchDeliveryPartners = async () => {
          try {
            const deliveryPartnersQuery = query(
              collection(db, 'delivery_man'),
              where('current_duty', '==', 'Available')
            );

            const snapshot = await getDocs(deliveryPartnersQuery);
            const partners = snapshot.docs.map(doc => ({
              id: doc.id,
              name: doc.data().name || 'Unknown',
              phone: doc.data().phone || '',
              email: doc.data().email || '',
              current_duty: doc.data().current_duty || 'Available',
              distance: `${Math.floor(Math.random() * 5) + 1} km` // Random distance for demo
            }));
            
            setDeliveryPartners(partners);
          } catch (error) {
            console.error('Error fetching delivery partners:', error);
          }
        };

        fetchDeliveryPartners();

      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
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

  // Add useEffect for orders
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeOrders = () => {
      if (shop) {
        unsubscribe = fetchOrders();
      }
    };

    initializeOrders();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [shop, products]); // Add products as dependency since it's used in calculateStats

  // Advanced stats calculation with comparative metrics
  const calculateStats = (ordersList: Order[], productsList: Product[], shopId: string) => {
    const now = new Date();
    const filteredOrders = filterOrdersByTimeframe(ordersList, timeframe);

    // Calculate current period stats
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((acc, order) =>
      acc + (order.totalAmount || 0), 0);
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate sales growth (comparing with previous period)
    const previousPeriodOrders = filterOrdersByTimeframe(ordersList, getPreviousTimeframe(timeframe));
    const previousRevenue = previousPeriodOrders.reduce((acc, order) =>
      acc + (order.totalAmount || 0), 0);
    const salesGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Calculate order growth
    const orderGrowth = previousPeriodOrders.length > 0
      ? ((totalOrders - previousPeriodOrders.length) / previousPeriodOrders.length) * 100
      : 0;

    // Calculate top selling products
    const productSaleMap = new Map();
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

    const topSellingProducts = Array.from(productSaleMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Generate revenue data for chart
    const revenueData = generateRevenueData(filteredOrders);

    // Calculate sales by category
    const categoryMap = new Map();
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

  // Helper function to get previous timeframe
  const getPreviousTimeframe = (current: 'today' | 'week' | 'month'): 'today' | 'week' | 'month' => {
    switch (current) {
      case 'today':
        return 'week';
      case 'week':
        return 'month';
      case 'month':
        return 'month';
    }
  };

  // Update the generateRevenueData function
  const generateRevenueData = (orders: Order[]): RevenueData[] => {
    const revenueByDay = new Map<string, number>();
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const current = revenueByDay.get(date) || 0;
      revenueByDay.set(date, current + (order.totalAmount || 0));
    });

    return Array.from(revenueByDay.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
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
    return new Date(timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  useEffect(() => {
    const checkApproval = async () => {
      const user = auth.currentUser;
      if (user) {
        const vendorDoc = await getDoc(doc(db, 'Vendors', user.uid));
        if (!vendorDoc.exists()) {
          navigate('/pending-approval');
        }
      }
    };
    checkApproval();
  }, [navigate]);

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
                value={776}
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
                value={5}
                icon={<CreditCard className="h-5 w-5 text-amber-600" />}
                change={2.1}
                trend="up"
              />
              <StatCard
                title="Pending Orders"
                value={"None"}
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
                          Order ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivery Partner
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
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            No recent orders found
                          </td>
                        </tr>
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
                    {deliveryPartners.map((partner) => (
                      <DeliveryPartnerInfo
                        key={partner.id}
                        partnerName={partner.name}
                        distance={partner.distance}
                        status={partner.current_duty}
                      />
                    ))}

                    {deliveryPartners.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No delivery partners available at the moment
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Currently Assigned
                    </div>

                    {/* Assigned Partners */}
                    {recentOrders
                      .filter(order => order.status === 'assigned' && order.assignedDeliveryManId)
                      .map((order) => (
                        <div key={order.id} className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 mb-2">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {order.assignedDeliveryManName || "Partner name"}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                ID: {order.assignedDeliveryManId || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {!recentOrders.some(order => order.status === 'assigned' && order.assignedDeliveryManId) && (
                      <div className="text-center py-4 text-gray-500">
                        No orders currently assigned to delivery partners
                      </div>
                    )}
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
                        Sales
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.slice(0, 5).map((product, index) => {
                      const sales = Math.floor(Math.random() * 50) + 10; // Random sales for demo
                      const revenue = sales * (product.price || 0);
                      const stock = Math.floor(Math.random() * 100);
                      const stockStatus = stock < 10 ? 'Low' : stock < 30 ? 'Medium' : 'High';

                      return (
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
                                <div className="text-xs text-gray-500">{formatCurrency(product.price || 0)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{product.category || 'Uncategorized'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{sales} units</div>
                            <div className="text-xs text-gray-500">Last 30 days</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(revenue)}</div>
                            <div className="text-xs text-gray-500">Total revenue</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${
                              stock < 10 ? 'text-rose-600' : 
                              stock < 30 ? 'text-amber-600' : 
                              'text-emerald-600'
                            }`}>
                              {stock} in stock
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              stockStatus === 'Low' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              stockStatus === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {stockStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
              {selectedOrder.assignedDeliveryManId && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">Delivery Partner</div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{selectedOrder.assignedDeliveryManName || "Partner name"}</div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {selectedOrder.distance} away
                          </div>
                          <div className="text-xs text-gray-500">
                            ETA: {typeof selectedOrder.estimatedArrival === 'string' 
                              ? selectedOrder.estimatedArrival 
                              : selectedOrder?.estimatedArrival instanceof Date 
                                ? selectedOrder.estimatedArrival.toLocaleTimeString()
                                : "En route"}
                          </div>
                        </div>
                      </div>
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