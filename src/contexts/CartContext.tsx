import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { CartItem } from '../types/types';

interface CartContextType {
  items: CartItem[];
  total: number;
  loading: boolean;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  getQuantity: (productId: string) => number;
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const calculateTotal = useCallback((items: CartItem[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, []);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      const cartRef = doc(db, 'carts', user.uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const validItems = Array.isArray(cartData.items) ? cartData.items : [];
        setItems(validItems);
        setTotal(calculateTotal(validItems));
      } else {
        // Create empty cart if it doesn't exist
        await setDoc(cartRef, { items: [], total: 0 });
        setItems([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user, calculateTotal]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const getQuantity = useCallback((productId: string) => {
    return items.find(item => item.productId === productId)?.quantity || 0;
  }, [items]);

  const updateCart = useCallback(async (newItems: CartItem[]) => {
    if (!user) return;

    const newTotal = calculateTotal(newItems);
    const cartRef = doc(db, 'carts', user.uid);
    
    try {
      await updateDoc(cartRef, {
        items: newItems,
        total: newTotal,
        updatedAt: new Date()
      });
      setItems(newItems);
      setTotal(newTotal);
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    }
  }, [user, calculateTotal]);

  const addToCart = useCallback(async (item: CartItem) => {
    if (!user) throw new Error('Authentication required');

    const existingIndex = items.findIndex(i => i.productId === item.productId);
    let newItems = [...items];

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += item.quantity;
    } else {
      newItems.push(item);
    }

    await updateCart(newItems);
  }, [items, user, updateCart]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!user) return;

    const newItems = items.filter(item => item.productId !== productId);
    await updateCart(newItems);
  }, [items, user, updateCart]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!user) return;
    if (quantity < 1) return removeFromCart(productId);

    const newItems = items.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    );
    
    await updateCart(newItems);
  }, [items, user, removeFromCart, updateCart]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await updateCart([]);
  }, [user, updateCart]);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        getQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}