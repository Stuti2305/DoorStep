
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import {
  collection, query, where, getDocs, orderBy,
  limit, doc, onSnapshot, Timestamp,
  startAfter, startAt, limitToLast, documentId, getDoc, setDoc, deleteDoc
} from 'firebase/firestore';
import {
  Users, Package, TrendingUp, DollarSign,
  Calendar, CheckCircle, Clock, ChevronRight,
  PlusCircle, Settings, Bell, Menu, Search, User,
  AlertTriangle, ChevronDown, Truck, Store, X, LogOut,
  ArrowUpRight, BarChart3, CircleDollarSign, Wallet,
  ArrowDown, ArrowUp, CreditCard, Filter, Download,
  ChevronLeft, MoreHorizontal, ListFilter, MapPin,
  Shield, ShoppingBag, Building2, GraduationCap
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  last30DaysRevenue: number;
  activeUsers: number;
  activeStudents: number;
  activeDeliveryAgents: number;
  totalVendors: number;
  availableDeliveryMen: number;
  busyDeliveryMen: number;
  todayOrders: {
    total: number;
    pending: number;
    outForDelivery: number;
    delivered: number;
  };
  totalShops: number;
  totalStudents: number;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  status: string;
  totalProducts: number;
  totalOrders: number;
}

interface DeliveryAgent {
  id: string;
  name: string;
  email: string;
  status: string;
  totalDeliveries: number;
  earnings: number;
}

interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  totalProducts?: number;
  totalOrders?: number;
  totalDeliveries?: number;
  earnings?: number;
}

interface PendingRequest {
  id: string;
  vendorName?: string;
  shopName?: string;
  name?: string;
  userType: string;
  ownerId?: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    last30DaysRevenue: 0,
    activeUsers: 0,
    activeStudents: 0,
    activeDeliveryAgents: 0,
    totalVendors: 0,
    availableDeliveryMen: 0,
    busyDeliveryMen: 0,
    todayOrders: {
      total: 0,
      pending: 0,
      outForDelivery: 0,
      delivered: 0
    },
    totalShops: 0,
    totalStudents: 0,
    categories: []
  });
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingVendors, setPendingVendors] = useState<PendingRequest[]>([]);
  const [pendingDeliveryMen, setPendingDeliveryMen] = useState<PendingRequest[]>([]);

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // Fetch orders
        const ordersQuery = query(collection(db, 'orders'));
        const ordersSnapshot = await getDocs(ordersQuery);
        const orders = ordersSnapshot.docs.map(doc => doc.data());
        
        // Calculate order stats
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
        const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

        // Calculate last 30 days revenue
        const last30DaysOrders = orders.filter(order => {
          const orderDate = order.createdAt?.toDate();
          return orderDate && orderDate >= thirtyDaysAgo;
        });
        const last30DaysRevenue = last30DaysOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Calculate active students (those who placed orders in last 30 days)
        const activeStudentIds = new Set(
          last30DaysOrders
            .filter(order => order.userId) // Filter out orders without userId
            .map(order => order.userId)
        );
        const activeStudents = activeStudentIds.size;

        // Calculate today's orders
        const todayOrders = orders.filter(order => {
          const orderDate = order.createdAt?.toDate();
          return orderDate && orderDate >= today;
        });

        const todayOrdersStats = {
          total: todayOrders.length,
          pending: todayOrders.filter(order => order.status === 'pending').length,
          outForDelivery: todayOrders.filter(order => order.status === 'outfordelivery').length,
          delivered: todayOrders.filter(order => order.status === 'delivered').length
        };

        // Fetch users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const firestoreUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreUser[];
        
        // Calculate user stats
        const activeUsers = firestoreUsers.filter(user => user.status === 'active').length;
        const activeDeliveryAgents = firestoreUsers.filter(user => user.role === 'delivery' && user.status === 'active').length;
        const totalVendors = firestoreUsers.filter(user => user.role === 'vendor').length;

        // Fetch delivery men
        const deliveryMenQuery = query(collection(db, 'delivery_man'));
        const deliveryMenSnapshot = await getDocs(deliveryMenQuery);
        const deliveryMen = deliveryMenSnapshot.docs.map(doc => doc.data());
        
        // Calculate delivery men stats
        const availableDeliveryMen = deliveryMen.filter(man => man.current_duty === 'Available').length;
        const busyDeliveryMen = deliveryMen.filter(man => man.current_duty === 'Busy').length;

        // Fetch shops
        const shopsQuery = query(collection(db, 'shops'));
        const shopsSnapshot = await getDocs(shopsQuery);
        const totalShops = shopsSnapshot.size;

        // Fetch students
        const studentsQuery = query(collection(db, 'Students'));
        const studentsSnapshot = await getDocs(studentsQuery);
        const totalStudents = studentsSnapshot.size;

        // Fetch categories
        const categoriesQuery = query(collection(db, 'categories'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categories = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];

        setStats({
          totalOrders,
          pendingOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          last30DaysRevenue,
          activeUsers,
          activeStudents,
          activeDeliveryAgents,
          totalVendors,
          availableDeliveryMen,
          busyDeliveryMen,
          todayOrders: todayOrdersStats,
          totalShops,
          totalStudents,
          categories
        });

        // Set users, vendors, and delivery agents with proper typing
        setUsers(firestoreUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt
        })));

        setVendors(firestoreUsers
          .filter(user => user.role === 'vendor')
          .map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            totalProducts: user.totalProducts || 0,
            totalOrders: user.totalOrders || 0
          })));

        setDeliveryAgents(firestoreUsers
          .filter(user => user.role === 'delivery')
          .map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            totalDeliveries: user.totalDeliveries || 0,
            earnings: user.earnings || 0
          })));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const vendorQuery = query(collection(db, 'onboarding_requests'), where('userType', '==', 'Vendor'));
        const vendorSnapshot = await getDocs(vendorQuery);
        const vendors = await Promise.all(vendorSnapshot.docs.map(async (doc) => {
          const vendorData = doc.data();
          console.log('Vendor Name:', vendorData.vendorName);  // Debugging log for vendor name
          const shopQuery = query(collection(db, 'onboarding_requests'), where('ownerId', '==', doc.id));
          const shopSnapshot = await getDocs(shopQuery);
          const shopName = shopSnapshot.docs.length > 0 ? shopSnapshot.docs[0].data().name : 'No Shop';
          return { id: doc.id, vendorName: vendorData.vendorName, shopName, userType: vendorData.userType, ownerId: vendorData.ownerId };
        }));
        console.log('Fetched Vendors with Shops:', vendors);
        setPendingVendors(vendors as PendingRequest[]);

        const deliveryQuery = query(collection(db, 'onboarding_requests'), where('userType', '==', 'Delivery'));
        const deliverySnapshot = await getDocs(deliveryQuery);
        const deliveryMen = deliverySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, userType: doc.data().userType }));
        console.log('Fetched Delivery Men:', deliveryMen);
        setPendingDeliveryMen(deliveryMen);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    fetchPendingRequests();
  }, []);

  // Additional rendering check
  useEffect(() => {
    console.log('Pending Vendors State:', pendingVendors);
    console.log('Pending Delivery Men State:', pendingDeliveryMen);
  }, [pendingVendors, pendingDeliveryMen]);

  const approveVendor = async (vendor: PendingRequest) => {
    try {
      // Fetch the vendor document again from the onboarding_requests collection
      const vendorDocRef = doc(db, 'onboarding_requests', vendor.id);
      const vendorDocSnap = await getDoc(vendorDocRef);
      if (!vendorDocSnap.exists()) {
        console.error('Vendor document not found in onboarding_requests');
        return;
      }
      const vendorData = vendorDocSnap.data();
      console.log('Adding to Vendors:', vendorData); // Log vendor data
      const vendorDoc = doc(db, 'Vendors', vendor.id);
      await setDoc(vendorDoc, vendorData); // Move the entire vendor document as is

      // Fetch and move the shop document
      const shopQuery = query(collection(db, 'onboarding_requests'), where('ownerId', '==', vendor.id));
      const shopSnapshot = await getDocs(shopQuery);
      shopSnapshot.forEach(async (shopDoc) => {
        const shopData = shopDoc.data();
        console.log('Adding to Shops:', shopData); // Log shop data
        const shopDocRef = doc(db, 'shops', shopData.ownerId); // Use shopDoc.id for the document ID
        await setDoc(shopDocRef, shopData);
        await deleteDoc(shopDoc.ref);
      });

      await deleteDoc(vendorDocRef);
      setPendingVendors(pendingVendors.filter(v => v.id !== vendor.id));
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };

  const approveDeliveryMan = async (deliveryMan: PendingRequest) => {
    try {
      // Fetch the delivery man document again from the onboarding_requests collection
      const deliveryDocRef = doc(db, 'onboarding_requests', deliveryMan.id);
      const deliveryDocSnap = await getDoc(deliveryDocRef);
      if (!deliveryDocSnap.exists()) {
        console.error('Delivery man document not found in onboarding_requests');
        return;
      }
      const deliveryData = deliveryDocSnap.data();
      console.log('Adding to Delivery Man:', deliveryData); // Log delivery man data
      const deliveryDoc = doc(db, 'delivery_man', deliveryMan.id);
      await setDoc(deliveryDoc, deliveryData); // Move the entire delivery man document as is

      await deleteDoc(deliveryDocRef);
      setPendingDeliveryMen(pendingDeliveryMen.filter(d => d.id !== deliveryMan.id));
    } catch (error) {
      console.error('Error approving delivery man:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayOrders.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-sm font-medium text-amber-600">{stats.todayOrders.pending}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Out for Delivery</p>
                <p className="text-sm font-medium text-blue-600">{stats.todayOrders.outForDelivery}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Delivered</p>
                <p className="text-sm font-medium text-emerald-600">{stats.todayOrders.delivered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">₹{stats.last30DaysRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeStudents}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">Placed orders in last 30 days</p>
            </div>
          </div>


          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Delivery Men Status</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.availableDeliveryMen + stats.busyDeliveryMen}</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Truck className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Available</p>
                <p className="text-sm font-medium text-emerald-600">{stats.availableDeliveryMen}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Busy</p>
                <p className="text-sm font-medium text-amber-600">{stats.busyDeliveryMen}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <GraduationCap className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">Students</span>
                  </div>
                  <span className="text-sm text-gray-500">{stats.totalStudents}</span>
                </div>
                <div className="flex space-x-2">
                  <Link to="/admin/student-details" className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">
                    View Details
                  </Link>
                  {/* <button className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded">Block</button>
                  <button className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded">Delete</button> */}
                </div>
              </div>


            </div>
          </div>

          {/* Vendor Management */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">Total Shops</span>
                  </div>
                  <span className="text-sm text-gray-500">{stats.totalShops}</span>
                </div>
                <div className="flex space-x-2">
                  <Link to="/admin/vendors" className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">
                    View Vendors
                  </Link>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">Total Delivery Men</span>
                  </div>
                  <span className="text-sm text-gray-500">{stats.availableDeliveryMen + stats.busyDeliveryMen}</span>
                </div>
                <div className="flex space-x-2">
                  <Link to="/admin/delivery-men" className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">
                    View Details
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Product Categories</h2>
            <Link
              to="/admin/categories"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <PlusCircle className="w-5 h-5" />
              Manage Categories
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.categories.map((category) => (
              <Link
                key={category.id}
                to={`/admin/category/${category.id}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Vendor Requests</h2>
            <ul className="divide-y divide-gray-200">
              {pendingVendors.map(vendor => (
                <li key={vendor.id} className="flex justify-between items-center py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{vendor.vendorName}</p>
                    <p className="text-xs text-gray-500">Shop: {vendor.shopName}</p>
                  </div>
                  <button onClick={() => approveVendor(vendor)} className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">Approve</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Delivery Men Requests</h2>
            <ul className="divide-y divide-gray-200">
              {pendingDeliveryMen.map(deliveryMan => (
                <li key={deliveryMan.id} className="flex justify-between items-center py-4">
                  <p className="text-sm font-medium text-gray-700">{deliveryMan.name}</p>
                  <button onClick={() => approveDeliveryMan(deliveryMan)} className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">Approve</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 

