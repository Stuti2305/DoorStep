// // types.ts
// export interface OrderItem {
//     productId: string;
//     name: string;
//     price: number;
//     quantity: number;
//     imageUrl: string;
//   }
  
//   export interface Order {
//     id: string;
//     userId: string;
//     items: OrderItem[];
//     totalAmount: number;
//     status: 'paid' | 'pending';
//     createdAt: string;
//     updatedAt: string;
//   }
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
    items?: Array<{
      productId: string;
      name: string;
      price: number;
    }>,
    quantity: number;
    price: number;
    name: string;
    imageUrl: string;
    shopId: string; // Ensure this is required (no question mark)
  }
  
  export interface Order {
    id: string;
    orderId: string;
    userId: string;
    shopId: string; // Make sure this exists
    name?: string;
    phone?: string;
    items: {
      productId: string;
      shopId: string;
      name: string;
      price: number;
      quantity: number;
      imageUrl?: string;
    }[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'delivered' | 'cancelled'|'assigned'|'pickedup'|'outfordelivery';
    createdAt: number;
    updatedAt?: number;
    estimatedDeliveryTime?: Date;
    imageURL?: string;
    hostel?: string;
    room?: string;
    deliveryAddress?: {
      hostel: string;
      room: string;
    };
    deliveryFee?: number; // Optional field for delivery fee
    deliveryPartner?: {
      name: string;
      phone: string;
      vehicleType: string; // e.g., bike, car, etc.
      vehicleNumber: string;
      estimatedArrival: Date; // Estimated arrival time for the delivery partner
      distance: number; // Distance from the shop to the delivery location in km
    } // Optional field for delivery partner

  }
  
  export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }
  
  export interface Shop {
    image: string | undefined;
    id: string;
    ownerId: string;
    name: string;
    description: string;
    location: string;
    rating?: number;
    imageUrl?: string;
    promoted?: boolean;
    cuisine?: string;
    offers?: string[];
    deliveryTime?: string; // in minutes
    deliveryFee?: number;
    priceForTwo?: number;
    categories: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    address?: string;
    phone?: string;
    email?: string;
    orders?: string[]; // Add this line to include the orders property
  }