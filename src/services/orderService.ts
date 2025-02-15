import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import type { Order, CartItem } from '../types';

export const orderService = {
  async createOrder(userId: string, shopId: string, items: CartItem[], deliveryAddress: string) {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderData = {
      userId,
      shopId,
      items,
      total,
      status: 'pending',
      deliveryAddress,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60000) // 30 minutes from now
    };

    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    return { id: orderRef.id, ...orderData };
  },

  async getOrder(orderId: string) {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (!orderDoc.exists()) throw new Error('Order not found');
    return { id: orderDoc.id, ...orderDoc.data() } as Order;
  },

  async getUserOrders(userId: string) {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  },

  async getShopOrders(shopId: string) {
    const q = query(
      collection(db, 'orders'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp()
    });
  }
}; 