export type Order = {
    id: string;
    orderId: string;
    userId: string;
    name: string;
    phone: string;
    hostel: string;
    room: string;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      imageUrl: string;
      shopId: string;
    }>;
    totalAmount: number;
    status: 'pending' | 'processing' | 'delivered' | 'cancelled';
    createdAt: number;
    imageURL: string;
  };


  export type CartItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    shopId: string;
  };
  

  