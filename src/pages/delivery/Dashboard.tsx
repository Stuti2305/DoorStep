import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { User, Phone, Shield, ToggleLeft, ToggleRight, Package, Clock, CheckCircle, Settings } from 'lucide-react';
import { Order } from '../../types/types';

export default function DeliveryDashboard() {
  const [deliveryPartner, setDeliveryPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliveryPartnerData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/auth');
          return;
        }

        // Fetch delivery partner details
        const deliveryPartnerRef = doc(db, 'delivery_man', user.uid);
        const deliveryPartnerSnap = await getDoc(deliveryPartnerRef);
        
        if (!deliveryPartnerSnap.exists()) {
          throw new Error('Delivery partner data not found');
        }

        setDeliveryPartner(deliveryPartnerSnap.data());

        // Fetch assigned orders
        const ordersRef = collection(db, 'orders');
        const assignedOrdersQuery = query(
          ordersRef,
          where('deliveryPartner.del_man_id', '==', user.uid),
          where('status', 'in', ['assigned', 'pickedup', 'outfordelivery']),
          orderBy('createdAt', 'desc')
        );
        const assignedOrdersSnap = await getDocs(assignedOrdersQuery);
        setAssignedOrders(assignedOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));

        // Fetch delivered orders
        const deliveredOrdersQuery = query(
          ordersRef,
          where('deliveryPartner.del_man_id', '==', user.uid),
          where('status', '==', 'delivered'),
          orderBy('createdAt', 'desc')
        );
        const deliveredOrdersSnap = await getDocs(deliveredOrdersQuery);
        setDeliveredOrders(deliveredOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));

      } catch (error) {
        console.error('Error fetching delivery partner data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryPartnerData();
  }, [navigate]);

  const toggleAvailability = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const deliveryPartnerRef = doc(db, 'delivery_man', user.uid);
      const newStatus = deliveryPartner?.current_duty === 'Available' ? 'Not Available' : 'Available';
      
      await updateDoc(deliveryPartnerRef, {
        current_duty: newStatus,
        updated_at: new Date()
      });

      setDeliveryPartner(prev => ({
        ...prev,
        current_duty: newStatus
      }));
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Delivery Partner Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Delivery Partner Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={toggleAvailability}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  deliveryPartner?.current_duty === 'Available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {deliveryPartner?.current_duty === 'Available' ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                {deliveryPartner?.current_duty}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{deliveryPartner?.name}</h2>
                  <p className="text-sm text-gray-500">{deliveryPartner?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Phone Number</h3>
                  <p className="text-sm text-gray-500">{deliveryPartner?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Driving License</h3>
                  <p className="text-sm text-gray-500">{deliveryPartner?.driving_license_no}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assigned Orders</h2>
          {assignedOrders.length > 0 ? (
            <div className="space-y-4">
              {assignedOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order.orderId || order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pickedup' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Total Amount: ₹{order.totalAmount}
                    </p>
                    {order.deliveryAddress && (
                      <p className="text-sm text-gray-600 mt-1">
                        Delivery to: {order.deliveryAddress.hostel}, Room {order.deliveryAddress.room}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No assigned orders</p>
          )}
        </div>

        {/* Delivered Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Delivered Orders</h2>
          {deliveredOrders.length > 0 ? (
            <div className="space-y-4">
              {deliveredOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order.orderId || order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Delivered
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Total Amount: ₹{order.totalAmount}
                    </p>
                    {order.deliveryAddress && (
                      <p className="text-sm text-gray-600 mt-1">
                        Delivered to: {order.deliveryAddress.hostel}, Room {order.deliveryAddress.room}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No delivered orders</p>
          )}
        </div>
      </div>
    </div>
  );
} 