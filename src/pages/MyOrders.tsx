
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { Package, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import type { Order } from '../types/types';

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const userOrders = await orderService.getUserOrders(user.uid);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Cancelled';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5733]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <Link to="/home" className="text-[#FF5733] hover:text-[#FF5733]/80 font-medium">
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Link to="/home" className="inline-flex items-center gap-2 bg-[#FF5733] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#FF5733]/90">
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <img
                    src={`data:image/jpeg;base64,${order.imageURL}`}
                    alt={`Order ${order.orderId}`}
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <h2 className="font-semibold text-gray-900 text-lg">#{order.orderId}</h2>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 mt-2">
                      <div><strong>Name:</strong> GINNY MILLER</div>
                      <div><strong>Phone:</strong> 8989098909</div>
                      <div><strong>Total:</strong> ₹{order.totalAmount}</div>
                      <div><strong>Hostel:</strong> CHAITYAM</div>
                      <div><strong>Room:</strong> 33</div>
                      <div><strong>Ordered On:</strong> {formatDate(order.createdAt)}</div>
                    </div>

                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-medium text-gray-900 mb-2">Items:</h3>
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between text-sm">
                            <span>
                              {item.quantity} × {item.name}
                            </span>
                            <span>₹{item.price * item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}