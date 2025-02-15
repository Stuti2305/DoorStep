// types.ts
export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }
  
  export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'paid' | 'pending';
    createdAt: string;
    updatedAt: string;
  }