import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Loader, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Order {
  id: string;
  orderId: string;
  userId: string;
  items: any[];
  status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered';
  totalAmount: number;
  createdAt: any;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('Current User:', user); // Debugging line

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        console.log('User not logged in. Skipping fetch.'); // Debugging line
        return;
      }

      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        console.log('Firestore Query:', q); // Debugging line
        console.log('Query Snapshot:', querySnapshot); // Debugging line

        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];

        console.log('Fetched Orders:', ordersData); // Debugging line
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-4">No Orders Found</h2>
          <p className="text-gray-600">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order ID: {order.orderId}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-semibold text-gray-900">₹{order.totalAmount}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.createdAt?.seconds * 1000).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}