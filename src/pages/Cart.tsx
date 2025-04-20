import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import type { Order } from '../types/types';

export default function Cart() {

  const { items, total, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    console.log("Cart items:", items);
    console.log("Cart total:", total);
  }, [items, total]);
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
 
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-100 px-4">
        <div className="max-w-md bg-orange-500 text-white rounded-2xl shadow-lg p-8 text-center">
          <img src="/empty-cart.svg" alt="Empty Cart" className="w-40 h-40 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-3">Your cart is empty</h2>
          <p className="mb-6">Add items to your cart to start shopping</p>
          <Link
            to="/home"
            className="inline-flex items-center px-6 py-3 bg-white text-orange-600 rounded-full shadow-md
                     hover:bg-gray-200 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-100 pt-10 px-4">
      <div className="max-w-sm mx-auto bg-orange-500 text-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🛒 Cart
        </h1>
        <p className="mb-4">You have {items.length} item{items.length > 1 ? 's' : ''} in the cart</p>
        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-orange-400 p-3 rounded-lg flex items-center gap-3 shadow"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg border border-white"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <p className="text-xs">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 bg-orange-300 rounded-full hover:bg-orange-200 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 bg-orange-300 rounded-full hover:bg-orange-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="mt-6 border-t border-white pt-4 text-sm">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax and Fees</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Delivery</span>
            <span>₹10.00</span>
          </div>
          <div className="border-t border-white pt-2 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{total + 10}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full py-3 mt-4 bg-yellow-400 text-orange-900 rounded-full font-semibold
                   hover:bg-yellow-300 transition-all shadow"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}