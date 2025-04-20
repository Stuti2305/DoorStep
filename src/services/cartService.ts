import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { CartItem } from '../types';

export const cartService = {
  async getCart(userId: string) {
    const cartDoc = await getDoc(doc(db, 'carts', userId));
    if (!cartDoc.exists()) return { items: [], total: 0 };
    return cartDoc.data();
  },

  async updateCart(userId: string, items: CartItem[]) {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    await setDoc(doc(db, 'carts', userId), {
      items,
      total,
      updatedAt: serverTimestamp()
    });

    return { items, total };
  },

  async addToCart(userId: string, newItem: CartItem, existingItems: CartItem[]) {
    const items = [...existingItems];
    const existingItemIndex = items.findIndex(item => item.productId === newItem.productId);

    if (existingItemIndex >= 0) {
      items[existingItemIndex].quantity += newItem.quantity;
    } else {
      items.push(newItem);
    }

    return this.updateCart(userId, items);
  },

  async removeFromCart(userId: string, productId: string, existingItems: CartItem[]) {
    const items = existingItems.filter(item => item.productId !== productId);
    return this.updateCart(userId, items);
  },

  async updateQuantity(userId: string, productId: string, quantity: number, existingItems: CartItem[]) {
    const items = existingItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: Math.max(0, quantity) }
        : item
    ).filter(item => item.quantity > 0);

    return this.updateCart(userId, items);
  },

  async clearCart(userId: string) {
    await deleteDoc(doc(db, 'carts', userId));
    return { items: [], total: 0 };
  }
}; 