export type UserRole = 'admin' | 'shopkeeper' | 'student';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  shopId?: string; // Only for shopkeepers
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
  shopId?: string;
}

export interface Order {
  id: string;
  userId: string;
  shopId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered';
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  deliveryAddress: string;
  estimatedDeliveryTime?: Date;
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
  categories: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  address?: string;
  phone?: string;
  email?: string;
}