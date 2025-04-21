import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  CheckCircle, 
  Clock, 
  Circle, 
  AlertCircle, 
  Phone, 
  User, 
  Info,
  Package,
  Calendar,
  CreditCard,
  Home,
  Check
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  id: string;
  userId: string;
  status: string;
  address: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  assignedDeliveryManId?: string;
  assignedDeliveryManName?: string;
  deliveryPartnerPhone?: string;
  statusHistory?: {
    status: string;
    timestamp: {
      seconds: number;
      nanoseconds: number;
    };
    notes?: string;
  }[];
  items?: Array<{
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>;
  totalAmount?: number;
  orderId?: string;
}

export default function Tracking() {
  const { orderId: paramOrderId } = useParams();
  const location = useLocation();
  const { orderId: stateOrderId } = location.state || {};
  const orderId = paramOrderId || stateOrderId;
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate('/orders');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (!orderDoc.exists()) {
          setError('Order not found');
          setLoading(false);
          return;
        }

        const orderData = orderDoc.data() as Order;
        
        if (orderData.userId !== user.uid) {
          setError('Unauthorized access');
          setLoading(false);
          return;
        }

        setOrder({ ...orderData, id: orderDoc.id });

        // Fetch delivery partner details if not already available
        if (orderData.assignedDeliveryManId && !orderData.deliveryPartnerPhone) {
          const partnerDoc = await getDoc(doc(db, 'delivery_man', orderData.assignedDeliveryManId));
          if (partnerDoc.exists()) {
            const partnerData = partnerDoc.data();
            setOrder(prev => ({
              ...prev!,
              deliveryPartnerPhone: partnerData.phone
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 py-12 px-4 sm:px-8 lg:px-12 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-orange-200 rounded-full mb-4"></div>
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-yellow-50 py-12 px-4 sm:px-8 lg:px-12 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Order not found'}</p>
          <Link
            to="/orders"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-300"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string, currentStatus: string) => {
    if (status === currentStatus) {
      return <Circle className="absolute -left-7 top-1 text-orange-500 w-5 h-5" fill="currentColor" />;
    }
    return status === 'delivered' ? (
      <CheckCircle className="absolute -left-7 top-1 text-green-600 w-5 h-5" fill="currentColor" />
    ) : (
      <Circle className="absolute -left-7 top-1 text-gray-400 w-5 h-5" />
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'accepted':
        return 'Order Accepted';
      case 'preparing':
        return 'Preparing Order';
      case 'ready':
        return 'Order Ready';
      case 'assigned':
        return 'Delivery Partner Assigned';
      case 'picked_up':
        return 'Order Picked Up';
      case 'on_the_way':
        return 'On the Way';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const getStatusNotes = (status: string) => {
    if (!order.statusHistory) return null;
    const statusEntry = order.statusHistory.find(h => h.status === status);
    return statusEntry?.notes || null;
  };

  const getStatusTime = (status: string) => {
    if (!order.statusHistory) return null;
    const statusEntry = order.statusHistory.find(h => h.status === status);
    if (!statusEntry) return null;
    return new Date(statusEntry.timestamp.seconds * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Check if order is confirmed (status of 'accepted' or beyond)
  const isOrderConfirmed = ['accepted', 'preparing', 'ready', 'assigned', 'picked_up', 'on_the_way', 'delivered'].includes(order.status);

  return (
    <div className="min-h-screen bg-yellow-50 py-12 px-4 sm:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Order Confirmation Banner */}
        {isOrderConfirmed && (
          <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 shadow-md">
            <div className="bg-green-500 rounded-full p-3 flex-shrink-0">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-green-800">Order is Now Confirmed!</h2>
              <p className="text-green-700">Your order #{order.orderId || order.id.slice(0, 8).toUpperCase()} has been confirmed and is being processed</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Package className="w-8 h-8" />
              <span>Order Tracking</span>
            </h1>
            <p className="text-orange-100 mt-1">
              Order ID: {order.orderId || order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Order Summary */}
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Info className="text-orange-500 w-5 h-5" />
                Order Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm">Order Date</p>
                    <p className="font-medium">
                      {new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="text-gray-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm">Total Amount</p>
                    <p className="font-medium">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="text-gray-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm">Items</p>
                    <p className="font-medium">
                      {order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0} items
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="text-gray-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm">Current Status</p>
                    <p className="font-medium capitalize text-orange-500">
                      {order.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Delivery Address */}
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Home className="text-orange-500 w-5 h-5" />
                  Delivery Address
                </h3>
                <div className="flex items-start gap-3">
                  <MapPin className="text-orange-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{order.address}</span>
                </div>
              </div>

              {/* Delivery Partner */}
              {order.assignedDeliveryManName ? (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <User className="text-blue-500 w-5 h-5" />
                    Delivery Partner
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="text-blue-600 w-5 h-5" />
                      <div>
                        <p className="text-gray-600 text-sm">Name</p>
                        <p className="font-medium">{order.assignedDeliveryManName}</p>
                      </div>
                    </div>
                    {order.deliveryPartnerPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="text-blue-600 w-5 h-5" />
                        <div>
                          <p className="text-gray-600 text-sm">Contact</p>
                          <a 
                            href={`tel:${order.deliveryPartnerPhone}`}
                            className="font-medium hover:text-blue-800 text-blue-600"
                          >
                            {order.deliveryPartnerPhone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  {order.status === 'assigned' && getStatusNotes('assigned') && (
                    <div className="mt-4 bg-blue-100 p-3 rounded-lg text-sm text-blue-800">
                      <p>{getStatusNotes('assigned')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Info className="text-orange-500 w-5 h-5" />
                    Delivery Status
                  </h3>
                  <p className="text-gray-700">
                    {order.status === 'pending' ? 
                      'Your order is pending confirmation. We will assign a delivery partner soon.' : 
                      'Preparing your order. A delivery partner will be assigned shortly.'}
                  </p>
                </div>
              )}
            </div>

            {/* Delivery Progress */}
            <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="text-orange-500 w-5 h-5" />
                Delivery Progress
              </h3>
              <div className="relative">
                {/* Progress Bar */}
                <div className="h-3 bg-gray-200 rounded-full mb-10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                    style={{
                      width: `${(order.statusHistory?.length || 0) * (100 / 8)}%`
                    }}
                  ></div>
                </div>
                
                {/* Status Timeline */}
                <div className="space-y-8 border-l-4 border-orange-300 pl-8">
                  {['pending', 'accepted', 'preparing', 'ready', 'assigned', 'picked_up', 'on_the_way', 'delivered'].map((status) => {
                    const isActive = order.status === status;
                    const isCompleted = order.statusHistory?.some(h => h.status === status);
                    
                    return (
                      <div key={status} className="relative">
                        {getStatusIcon(status, order.status)}
                        <div className={`pl-2 ${isActive ? 'animate-pulse' : ''}`}>
                          <p className={`font-medium flex justify-between items-center ${isActive ? 'text-orange-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                            <span className={`${isActive ? 'text-lg' : ''}`}>{getStatusText(status)}</span>
                            {getStatusTime(status) && (
                              <span className="text-sm text-gray-500 ml-4">
                                {getStatusTime(status)}
                              </span>
                            )}
                          </p>
                          {getStatusNotes(status) && (
                            <p className="text-sm text-gray-600 mt-1 ml-1">{getStatusNotes(status)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="text-orange-500 w-5 h-5" />
                  Order Items
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="w-16 h-16 bg-white rounded-md flex items-center justify-center overflow-hidden shadow-sm">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="text-gray-400 w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-medium text-orange-600">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/orders"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center"
              >
                Back to Orders
              </Link>
              {order.deliveryPartnerPhone && (
                <a
                  href={`tel:${order.deliveryPartnerPhone}`}
                  className="flex-1 bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call Delivery
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}