import { db } from '../lib/firebase';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { Product } from '../types';

export const productService = {
  // Get products by category
  async getProductsByCategory(category: string) {
    const q = query(
      collection(db, 'products'),
      where('category', '==', category),
      where('available', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];
  },

  // Get products by shop
  async getProductsByShop(shopId: string) {
    const q = query(
      collection(db, 'products'),
      where('shopId', '==', shopId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];
  },

  // Add new product without image upload
  async addProduct(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    // Instead of uploading an image, assign a default image URL (or leave empty)
    const productData = {
      ...product,
      imageUrl: '/images/products/default.jpg', // or you can set this to an empty string ''
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'products'), productData);
    return { id: docRef.id, ...productData };
  },

  // Update product (without image upload)
  async updateProduct(id: string, updates: Partial<Product>) {
    const updateData = { ...updates, updatedAt: serverTimestamp() };
    await updateDoc(doc(db, 'products', id), updateData);
  },

  // Delete product
  async deleteProduct(id: string) {
    await deleteDoc(doc(db, 'products', id));
  },
};
