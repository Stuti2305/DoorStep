import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DeliveryMan {
  name: string;
  email: string;
  phone: string;
  driving_license_no: string;
  current_duty: 'Available' | 'Not Available';
  admin_control: string;
  created_at: Date;
  updated_at: Date;
  del_man_id: string;
}

interface Order {
  id: string;
  orderId: string;
  userId: string;
  shopId: string;
  items: {
    productId: string;
    shopId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled' | 'assigned' | 'pickedup' | 'outfordelivery';
  createdAt: number;
  updatedAt?: number;
  estimatedDeliveryTime?: Date;
  deliveryAddress?: {
    hostel: string;
    room: string;
  };
}

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [deliveryMan, setDeliveryMan] = useState<DeliveryMan | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveryManData = async () => {
      if (!user) return;

      try {
        // Fetch delivery man data
        const deliveryManDoc = await getDoc(doc(db, 'delivery_man', user.uid));
        if (deliveryManDoc.exists()) {
          const data = deliveryManDoc.data() as DeliveryMan;
          setDeliveryMan(data);
          setIsAvailable(data.current_duty === 'Available');
        }

        // Fetch assigned orders
        const ordersQuery = query(
          collection(db, 'orders'),
          where('deliveryPartner.del_man_id', '==', user.uid)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        
        // Separate assigned and delivered orders
        const assigned = orders.filter(order => 
          order.status === 'assigned' || order.status === 'pickedup' || order.status === 'outfordelivery'
        );
        const delivered = orders.filter(order => order.status === 'delivered');
        
        setAssignedOrders(assigned);
        setDeliveredOrders(delivered);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryManData();
  }, [user]);

  const handleAvailabilityToggle = async () => {
    if (!user || !deliveryMan) return;

    try {
      const newStatus = !isAvailable ? 'Available' : 'Not Available';
      await updateDoc(doc(db, 'delivery_man', user.uid), {
        current_duty: newStatus,
        updated_at: new Date()
      });
      setIsAvailable(!isAvailable);
      setDeliveryMan(prev => prev ? { ...prev, current_duty: newStatus } : null);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'pickedup',
        'deliveryPartner.del_man_id': user.uid,
        updatedAt: new Date()
      });

      // Update local state
      setAssignedOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'pickedup' } 
            : order
        )
      );
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-white text-xl font-bold">Doorstep</span>
            </div>
            <div className="flex items-center">
              <Link to="/settings" className="text-white hover:text-gray-200">
                <Settings className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
          {deliveryMan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name: {deliveryMan.name}</p>
                <p className="text-gray-600">Email: {deliveryMan.email}</p>
                <p className="text-gray-600">Phone: {deliveryMan.phone}</p>
                <p className="text-gray-600">License No: {deliveryMan.driving_license_no}</p>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleAvailabilityToggle}
                  className={`px-4 py-2 rounded-full text-white font-medium ${
                    isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isAvailable ? 'Available' : 'Not Available'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Assigned Orders</h2>
          {assignedOrders.length === 0 ? (
            <p className="text-gray-600">No orders assigned</p>
          ) : (
            <div className="space-y-4">
              {assignedOrders.map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Order #{order.orderId}</p>
                      <p className="text-gray-600">
                        {order.deliveryAddress?.hostel}, Room {order.deliveryAddress?.room}
                      </p>
                      <p className="text-gray-600">Total: ₹{order.totalAmount}</p>
                    </div>
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                    >
                      Accept Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Previously Delivered Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Previously Delivered Orders</h2>
          <p className="text-gray-600 mb-4">Total Orders Delivered: {deliveredOrders.length}</p>
          {deliveredOrders.length === 0 ? (
            <p className="text-gray-600">No previous deliveries</p>
          ) : (
            <div className="space-y-4">
              {deliveredOrders.map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                  <p className="font-medium">Order #{order.orderId}</p>
                  <p className="text-gray-600">
                    {order.deliveryAddress?.hostel}, Room {order.deliveryAddress?.room}
                  </p>
                  <p className="text-gray-600">Total: ₹{order.totalAmount}</p>
                  <p className="text-gray-600">
                    Delivered on: {new Date(order.updatedAt || order.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 