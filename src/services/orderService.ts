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