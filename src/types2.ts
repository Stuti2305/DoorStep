// in types/types.ts or types/index.ts
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderId?: string;
  userId: string;
  userName?: string;
  shopId: string;
  items: OrderItem[];
  total?: number;
  totalAmount?: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  createdAt: number;
  hostel?: string;
  room?: string;
  phoneNumber?: string;
  rating?: number;
  imageURL?: string;
}


  export type CartItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    shopId: string;
  };
  

  