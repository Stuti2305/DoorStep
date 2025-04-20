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
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import type { Order, CartItem } from '../types/types';

export const orderService = {
  async createOrder(userId: string, items: CartItem[], deliveryAddress: {hostel: string, room: string}, name: string, phone: string) {
    // Group items by shopId
    const itemsByShop = items.reduce((acc, item) => {
      if (!acc[item.shopId]) {
        acc[item.shopId] = [];
      }
      acc[item.shopId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
    
    // Create an order for each shop
    const orderPromises = Object.entries(itemsByShop).map(async ([shopId, shopItems]) => {
      const total = shopItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const orderData = {
        userId,
        shopId, // Critical - this must be at the top level
        items: shopItems,
        totalAmount: total,
        status: 'pending',
        deliveryAddress,
        name,
        phone,
        orderId: `order_${Math.random().toString(36).substring(2, 12)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
  
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      console.log(`Created order ${orderRef.id} for shop ${shopId}`);
      return { id: orderRef.id, ...orderData };
    });
    
    return Promise.all(orderPromises);
  },

  async getOrder(orderId: string) {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (!orderDoc.exists()) throw new Error('Order not found');
    return { id: orderDoc.id, ...orderDoc.data() } as Order;
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc') // sort by most recent first
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orderId: data.orderId,
          userId: data.userId,
          shopId: data.shopId, // Make sure this field exists
          name: data.name,
          phone: data.phone,
          hostel: data.deliveryAddress?.hostel || data.hostel,
          room: data.deliveryAddress?.room || data.room,
          items: data.items,
          totalAmount: data.totalAmount,
          status: data.status,
          createdAt: data.createdAt?.toDate()?.getTime() || Date.now(),
          imageURL: data.items[0]?.imageUrl || '/images/products/default.jpg'
        } as Order;
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getShopOrders: async (shopId: string) => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('shopId', '==', shopId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      // Debug output
      console.log('Shop Orders Query Params:', { shopId });
      console.log('Query Results:', querySnapshot.size, 'orders found');
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Order data:', doc.id, data);
        return {
          id: doc.id,
          ...data
        } as Order;
      });
    } catch (error) {
      console.error('Error fetching shop orders:', error);
      throw error;
    }
  },
  
  getRecentShopOrders: async (shopId: string, limitCount: number = 5) => {
    try {
      // Debug output
      console.log('Fetching recent orders for shop:', shopId);
      
      const q = query(
        collection(db, 'orders'),
        where('shopId', '==', shopId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      // More debug output
      console.log('Recent orders query returned:', querySnapshot.size, 'results');
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error('Error fetching recent shop orders:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp()
    });
  }
};