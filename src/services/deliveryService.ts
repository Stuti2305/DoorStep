import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch, getDoc } from 'firebase/firestore';

interface DeliveryMan {
  id: string;
  del_man_id: string;
  name: string;
  phone: string;
  email: string;
  current_duty: string;
  admin_control: string;
}

export const deliveryService = {
  async getDeliveryManDetails(delManId: string): Promise<DeliveryMan | null> {
    try {
      // First try to get the document directly by ID
      let delManDoc = await getDoc(doc(db, 'delivery_man', delManId));
      
      // If not found by ID, try to query by del_man_id
      if (!delManDoc.exists()) {
        const q = query(
          collection(db, 'delivery_man'),
          where('del_man_id', '==', delManId)
        );
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          console.log('No delivery man found with ID or del_man_id:', delManId);
          return null;
        }
        
        delManDoc = snapshot.docs[0];
      }
      
      const data = delManDoc.data();
      if (!data) {
        console.log('No data found for delivery man:', delManId);
        return null;
      }

      return {
        id: delManDoc.id,
        del_man_id: data.del_man_id || delManDoc.id,
        name: data.name || 'Delivery Partner',
        phone: data.phone || 'No contact',
        email: data.email || '',
        current_duty: data.current_duty || 'Unknown',
        admin_control: data.admin_control || 'inactive'
      };
    } catch (error) {
      console.error('Error fetching delivery man:', error);
      throw error;
    }
  },

  async assignDeliveryMan(orderId: string): Promise<DeliveryMan | null> {
    try {
      // First get the order details to get shop information
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (!orderDoc.exists()) {
        console.error('Order not found');
        return null;
      }

      const orderData = orderDoc.data();
      const shopId = orderData.shopId;

      if (!shopId) {
        console.error('No shop ID found in order');
        return null;
      }

      // Get shop details
      const shopDoc = await getDoc(doc(db, 'shops', shopId));
      if (!shopDoc.exists()) {
        console.error('Shop not found');
        return null;
      }

      const shopData = shopDoc.data();
      const shopLocation = shopData.location || 'default';

      // Get available delivery men near the shop location
      const q = query(
        collection(db, 'delivery_man'),
        where('admin_control', '==', 'active'),
        where('current_duty', '==', 'Available'),
        where('location', '==', shopLocation)
      );
      
      let deliveryMenSnapshot = await getDocs(q);
      if (deliveryMenSnapshot.empty) {
        console.log('No delivery men available in the shop location, trying other locations');
        // If no delivery men in shop location, try all available delivery men
        const allQ = query(
          collection(db, 'delivery_man'),
          where('admin_control', '==', 'active'),
          where('current_duty', '==', 'Available')
        );
        const allSnapshot = await getDocs(allQ);
        if (allSnapshot.empty) return null;
        deliveryMenSnapshot = allSnapshot;
      }

      const deliveryMen = deliveryMenSnapshot.docs;
      
      // Round-robin selection
      const lastIndex = parseInt(localStorage.getItem('lastDeliveryManIndex') || '-1');
      const nextIndex = (lastIndex + 1) % deliveryMen.length;
      localStorage.setItem('lastDeliveryManIndex', nextIndex.toString());

      const selected = deliveryMen[nextIndex];
      const delManData = selected.data();
      const delManId = delManData.del_man_id;

      // Batch update for atomic operation
      const batch = writeBatch(db);

      // Update order
      batch.update(doc(db, 'orders', orderId), {
        assignedDeliveryManId: delManId,
        assignedDeliveryManName: delManData.name,
        status: 'assigned',
        statusHistory: [
          {
            status: 'assigned',
            timestamp: new Date(),
            notes: `Assigned to ${delManData.name}`
          }
        ]
      });

      // Update delivery man
      batch.update(doc(db, 'delivery_man', selected.id), {
        current_duty: 'Busy',
        updated_at: new Date()
      });

      await batch.commit();

      return {
        id: selected.id,
        del_man_id: delManId,
        name: delManData.name || 'Delivery Partner',
        phone: delManData.phone || '',
        email: delManData.email,
        current_duty: 'Busy',
        admin_control: delManData.admin_control
      };
    } catch (error) {
      console.error('Delivery assignment error:', error);
      throw error;
    }
  }
};