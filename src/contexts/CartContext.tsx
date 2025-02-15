import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { CartItem } from '../types';
import { cartService } from '../services/cartService';

interface CartContextType {
  items: CartItem[];
  total: number;
  loading: boolean; // Add loading state
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state
  const { user } = useAuth();

  // Fetch cart items when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setItems([]);
        setTotal(0);
        setLoading(false); // Set loading to false
        return;
      }

      try {
        const cart = await cartService.getCart(user.uid);
        setItems(cart.items);
        setTotal(cart.total);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchCart();
  }, [user]);

  const addToCart = async (item: CartItem) => {
    if (!user) throw new Error('Must be logged in to add items to cart');

    const cart = await cartService.addToCart(user.uid, item, items);
    setItems(cart.items);
    setTotal(cart.total);
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    const cart = await cartService.removeFromCart(user.uid, productId, items);
    setItems(cart.items);
    setTotal(cart.total);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    const cart = await cartService.updateQuantity(user.uid, productId, quantity, items);
    setItems(cart.items);
    setTotal(cart.total);

    await setDoc(doc(db, 'carts', user.uid), {
      items: cart.items,
      total: cart.total,
      updatedAt: new Date(),
    });
  };

  const clearCart = async () => {
    if (!user) return;

    const cart = await cartService.clearCart(user.uid);
    setItems(cart.items);
    setTotal(cart.total);

    await deleteDoc(doc(db, 'carts', user.uid));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        loading, // Provide loading state
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}