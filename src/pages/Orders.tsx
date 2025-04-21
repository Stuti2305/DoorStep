import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { deliveryService } from '../services/deliveryService';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface StatusHistory {
  status: string;
  timestamp: Date;
  notes: string;
}

interface DeliveryMan {
  id: string;
  name: string;
  phone: string;
}

interface Order {
  id: string;
  orderId: string;
  items: OrderItem[];
  status: string;
  totalAmount: number;
  createdAt: Date;
  statusHistory: StatusHistory[];
  deliveryMan?: DeliveryMan;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const location = useLocation();
  const isSuccess = location.state?.isSuccess || false; // Check if payment was successful
  const deliveryTime = 'Thu, 29th, 4:00 PM'; // Example delivery time

  const fetchOrders = async () => {
    if (!user) {
      setError('Please log in to view your orders');
      setLoading(false);
      return;
    }

    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let deliveryMan: DeliveryMan | undefined;
          
          // Fetch delivery partner details if order has an assigned delivery partner
          if (data.assignedDeliveryManId) {
            try {
              const deliveryManData = await deliveryService.getDeliveryManDetails(data.assignedDeliveryManId);
              if (deliveryManData) {
                deliveryMan = {
                  id: deliveryManData.id,
                  name: deliveryManData.name,
                  phone: deliveryManData.phone
                };
              }
            } catch (error) {
              console.error('Error fetching delivery partner details:', error);
            }
          }

          return {
            id: doc.id,
            orderId: data.orderId || doc.id,
            items: data.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })),
            status: data.status,
            totalAmount: data.totalAmount,
            createdAt: data.createdAt.toDate(),
            statusHistory: data.statusHistory.map((history: any) => ({
              status: history.status,
              timestamp: history.timestamp.toDate(),
              notes: history.notes
            })),
            deliveryMan
          } as Order;
        })
      );

      setOrders(ordersData);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="mt-2 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Orders</h2>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchOrders();
            }}
            className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Link
            to="/shop"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">Order #{order.orderId}</h2>
                  <p className="text-gray-600">
                    Placed on {order.createdAt.toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">{order.items.length} items</p>
                </div>
              </div>

              {order.deliveryMan && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-2">Delivery Partner</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{order.deliveryMan.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{order.deliveryMan.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Status History</h3>
                <div className="space-y-3">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{history.status}</p>
                        <p className="text-sm text-gray-500">
                          {history.timestamp.toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {history.notes && (
                          <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <Link
                  to={`/tracking/${order.id}`}
                  state={{ orderId: order.id }}
                  className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Track Order
                </Link>
                <Link
                  to={`/order-details/${order.id}`}
                  className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {isSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center m-4">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Order Confirmed
        </h1>
        <p className="text-gray-600 mb-6">
              Your order has been placed successfully.
        </p>

          <p className="text-gray-600 mb-6">
            Delivery by <span className="font-semibold">{deliveryTime}</span>
          </p>

        <div className="flex flex-col gap-4">
            <Link
              to="/tracking"
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Track My Order
            </Link>
              <button
                onClick={() => {
                  const newLocation = {
                    ...location,
                    state: { ...location.state, isSuccess: false }
                  };
                  window.history.replaceState(newLocation.state, '', newLocation.pathname);
                }}
                className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}