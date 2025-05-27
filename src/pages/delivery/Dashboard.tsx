import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, arrayUnion } from 'firebase/firestore';
import { 
  User, Phone, Shield, ToggleLeft, ToggleRight, Package, Clock, CheckCircle, MapPin, 
  Box, Calendar, DollarSign, TrendingUp, ArrowRight, ChevronDown, ChevronUp, Truck
} from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your delivery details</p>
        </div>
      </div>
    );
  }

  // Function to format date in a more readable format
  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats
  const totalDeliveredToday = deliveredOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.setHours(0,0,0,0) === today.setHours(0,0,0,0);
  }).length;

  const totalAssigned = assignedOrders.length;
  const totalEarnings = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'assigned':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
          <Package className="w-4 h-4" />
          Assigned
        </span>;
      case 'outfordelivery':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
          <Truck className="w-4 h-4" />
          Out for delivery
        </span>;
      case 'delivered':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Delivered
        </span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Partner Dashboard</h1>
          <p className="text-gray-600">Manage your deliveries and track your progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Orders</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalAssigned}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Delivered Today</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalDeliveredToday}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{totalEarnings}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Partner Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-t border-blue-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                {deliveryPartner?.name?.charAt(0) || 'D'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{deliveryPartner?.name}</h2>
                <p className="text-sm text-gray-500">{deliveryPartner?.email}</p>
              </div>
            </div>
            <div>
              <button
                onClick={toggleAvailability}
                disabled={deliveryPartner?.current_duty === 'Busy'}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  deliveryPartner?.current_duty === 'Available'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                } ${deliveryPartner?.current_duty === 'Busy' ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {deliveryPartner?.current_duty === 'Available' ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                {deliveryPartner?.current_duty}
              </button>
              {deliveryPartner?.current_duty === 'Busy' && (
                <p className="text-xs text-red-500 mt-1">Complete active orders to change status</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Partner ID</h3>
                <p className="text-base font-medium text-gray-900">{deliveryPartner?.del_man_id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                <p className="text-base font-medium text-gray-900">{deliveryPartner?.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Driving License</h3>
                <p className="text-base font-medium text-gray-900">{deliveryPartner?.driving_license_no}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Orders */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Active Deliveries ({assignedOrders.length})
            </h2>
          </div>
          
          {assignedOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {assignedOrders.map((order) => (
                <div key={order.id} className="hover:bg-blue-50 transition-colors">
                  <div className="p-4">
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => toggleQuickView(order.id)}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {order.status === 'assigned' ? 
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <Package className="h-4 w-4" />
                            </div> :
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                              <Truck className="h-4 w-4" />
                            </div>
                          }
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {getStatusBadge(order.status)}
                        <div className="flex items-center mt-2 text-sm font-medium text-gray-700">
                          <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                          ₹{order.totalAmount}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      {order.deliveryAddress ? 
                        `${order.deliveryAddress.hostel}, Room ${order.deliveryAddress.room}` : 
                        'Delivery address not specified'
                      }
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      <button 
                        onClick={() => toggleQuickView(order.id)}
                        className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800"
                      >
                        {quickViewOrderId === order.id ? (
                          <>Hide Details <ChevronUp className="ml-1 w-4 h-4" /></>
                        ) : (
                          <>View Details <ChevronDown className="ml-1 w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                    
                    {quickViewOrderId === order.id && (
                      <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Box className="w-4 h-4 mr-2 text-blue-500" />
                          Order Items
                        </h4>
                        <ul className="space-y-2 mb-4">
                          {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100">
                              <span className="font-medium text-gray-800">{item.name}</span>
                              <div className="flex items-center gap-4">
                                <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                                  Qty: {item.quantity}
                                </span>
                                <span className="font-medium text-gray-900">₹{item.price}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="flex justify-between border-t border-blue-200 pt-3 mb-4">
                          <span className="font-medium text-gray-700">Total Amount</span>
                          <span className="font-bold text-blue-600">₹{order.totalAmount}</span>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                          {order.status === 'assigned' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'outfordelivery' as OrderStatus, 'Order Marked as Out for Delivery')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                            >
                              <Truck className="w-4 h-4 mr-2" />
                              Mark as Out for Delivery
                            </button>
                          )}
                          {order.status === 'outfordelivery' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered' as OrderStatus, 'Delivery completed')}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-gray-500 text-lg">No active orders at the moment</p>
              <p className="text-gray-400 text-sm mt-2">New orders will appear here when assigned to you</p>
            </div>
          )}
        </div>

        {/* Delivered Orders */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Deliveries ({deliveredOrders.length})
            </h2>
          </div>
          
          {deliveredOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {deliveredOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="hover:bg-green-50 transition-colors">
                  <div className="p-4">
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => toggleQuickViewDelivered(order.id)}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {getStatusBadge(order.status)}
                        <div className="flex items-center mt-2 text-sm font-medium text-gray-700">
                          <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                          ₹{order.totalAmount}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      {order.deliveryAddress ? 
                        `${order.deliveryAddress.hostel}, Room ${order.deliveryAddress.room}` : 
                        'Delivery address not specified'
                      }
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      <button 
                        onClick={() => toggleQuickViewDelivered(order.id)}
                        className="text-green-600 text-sm font-medium flex items-center hover:text-green-800"
                      >
                        {quickViewDeliveredOrderId === order.id ? (
                          <>Hide Details <ChevronUp className="ml-1 w-4 h-4" /></>
                        ) : (
                          <>View Details <ChevronDown className="ml-1 w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                    
                    {quickViewDeliveredOrderId === order.id && (
                      <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Box className="w-4 h-4 mr-2 text-green-500" />
                          Order Items
                        </h4>
                        <ul className="space-y-2 mb-4">
                          {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100">
                              <span className="font-medium text-gray-800">{item.name}</span>
                              <div className="flex items-center gap-4">
                                <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                                  Qty: {item.quantity}
                                </span>
                                <span className="font-medium text-gray-900">₹{item.price}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="flex justify-between border-t border-green-200 pt-3">
                          <span className="font-medium text-gray-700">Total Amount</span>
                          <span className="font-bold text-green-600">₹{order.totalAmount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-gray-500 text-lg">No completed deliveries yet</p>
              <p className="text-gray-400 text-sm mt-2">Your completed orders will appear here</p>
            </div>
          )}
          
          {deliveredOrders.length > 5 && (
            <div className="p-4 border-t border-gray-100 text-center">
              <button className="text-blue-600 font-medium hover:text-blue-800 flex items-center justify-center mx-auto">
                View All Delivered Orders <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}