import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, arrayUnion } from 'firebase/firestore';
import { User, Phone, Shield, ToggleLeft, ToggleRight, Package, Clock, CheckCircle } from 'lucide-react';
import { Order } from '../../types/types';
import * as firebase from 'firebase/app';
import { FieldValue } from 'firebase/firestore';

type OrderStatus = "assigned" | "pickedup" | "outfordelivery" | "delivered" | "pending" | "processing" | "cancelled";

export default function DeliveryDashboard() {
  const [deliveryPartner, setDeliveryPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [quickViewOrderId, setQuickViewOrderId] = useState<string | null>(null);
  const [quickViewDeliveredOrderId, setQuickViewDeliveredOrderId] = useState<string | null>(null);
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

        const deliveryPartnerData = deliveryPartnerSnap.data();
        setDeliveryPartner(deliveryPartnerData);

        // Fetch assigned orders
        const ordersRef = collection(db, 'orders');
        const assignedOrdersQuery = query(
          ordersRef,
          where('assignedDeliveryManId', '==', deliveryPartnerData.del_man_id),
          where('status', 'in', ['assigned', 'outfordelivery']),
          orderBy('createdAt', 'desc')
        );
        const assignedOrdersSnap = await getDocs(assignedOrdersQuery);

        const assignedOrders = assignedOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setAssignedOrders(assignedOrders);

        // Fetch delivered orders only if not already updated locally
        if (deliveredOrders.length === 0) {
          const deliveredOrdersQuery = query(
            ordersRef,
            where('assignedDeliveryManId', '==', deliveryPartnerData.del_man_id),
            where('status', '==', 'delivered'),
            orderBy('createdAt', 'desc')
          );
          const deliveredOrdersSnap = await getDocs(deliveredOrdersQuery);

          setDeliveredOrders(deliveredOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
        }

        // Update current_duty based on order status
        if (assignedOrders.length > 0) {
          await updateDoc(deliveryPartnerRef, {
            current_duty: 'Busy'
          });
          setDeliveryPartner((prev: any) => ({
            ...prev,
            current_duty: 'Busy'
          }));
        } else if (assignedOrders.length === 0 && deliveryPartnerData.current_duty === 'Busy') {
          await updateDoc(deliveryPartnerRef, {
            current_duty: 'Available'
          });
          setDeliveryPartner((prev: any) => ({
            ...prev,
            current_duty: 'Available'
          }));
        }

      } catch (error) {
        console.error('Error fetching delivery partner data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryPartnerData();
  }, [navigate, deliveredOrders.length]);

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

      setDeliveryPartner((prev: any) => ({
        ...prev,
        current_duty: newStatus
      }));
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const toggleQuickView = (orderId: string) => {
    setQuickViewOrderId(prev => (prev === orderId ? null : orderId));
  };

  const toggleQuickViewDelivered = (orderId: string) => {
    setQuickViewDeliveredOrderId(prev => (prev === orderId ? null : orderId));
  };

  useEffect(() => {
    console.log("Assigned Orders:", assignedOrders);
    console.log("Delivered Orders:", deliveredOrders);
  }, [assignedOrders, deliveredOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, note: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const timestamp = new Date();
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: timestamp,
        statusHistory: arrayUnion({
          notes: note,
          status: newStatus,
          timestamp: timestamp
        })
      });

      // Refetch assigned orders from the database
      const ordersRef = collection(db, 'orders');
      const assignedOrdersQuery = query(
        ordersRef,
        where('assignedDeliveryManId', '==', deliveryPartner?.del_man_id),
        where('status', 'in', ['assigned', 'outfordelivery']),
        orderBy('createdAt', 'desc')
      );
      const assignedOrdersSnap = await getDocs(assignedOrdersQuery);
      setAssignedOrders(assignedOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));

      // Fetch delivered orders if the status is 'delivered'
      if (newStatus === 'delivered') {
        const deliveredOrdersQuery = query(
          ordersRef,
          where('assignedDeliveryManId', '==', deliveryPartner?.del_man_id),
          where('status', '==', 'delivered'),
          orderBy('createdAt', 'desc')
        );
        const deliveredOrdersSnap = await getDocs(deliveredOrdersQuery);
        setDeliveredOrders(deliveredOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Use useEffect to update current_duty when assignedOrders changes
  useEffect(() => {
    if (assignedOrders.length === 0 && deliveryPartner?.current_duty === 'Busy') {
      setDeliveryPartner((prev: any) => ({
        ...prev,
        current_duty: 'Available'
      }));
    }
  }, [assignedOrders, deliveryPartner]);

  useEffect(() => {
    const checkApproval = async () => {
      const user = auth.currentUser;
      if (user) {
        const deliveryDoc = await getDoc(doc(db, 'delivery_man', user.uid));
        if (!deliveryDoc.exists()) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Delivery Partner Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Delivery Partner Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAvailability}
                disabled={deliveryPartner?.current_duty === 'Busy'}
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
                  <div className="flex justify-between items-start" onClick={() => toggleQuickView(order.id)}>
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
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
                  {quickViewOrderId === order.id && (
                    <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between items-center text-sm text-gray-700">
                            <span className="w-1/2">{item.name}</span>
                            <span className="w-1/4 text-center">₹{item.price}</span>
                            <span className="w-1/4 text-right">Qty: {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4">
                        {order.status === 'assigned' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'outfordelivery' as OrderStatus, 'Order Marked as Out for Delivery')}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
                          >
                            Mark as Out for Delivery
                          </button>
                        )}
                        {order.status === 'outfordelivery' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered' as OrderStatus, 'Delivery completed')}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg"
                          >
                            Mark as Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  )}
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
                  <div className="flex justify-between items-start" onClick={() => toggleQuickViewDelivered(order.id)}>
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
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
                  {quickViewDeliveredOrderId === order.id && (
                    <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between items-center text-sm text-gray-700">
                            <span className="w-1/2">{item.name}</span>
                            <span className="w-1/4 text-center">₹{item.price}</span>
                            <span className="w-1/4 text-right">Qty: {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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