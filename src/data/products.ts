export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Campus Essential Beauty Kit',
    price: 599,
    image: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19',
    category: 'Beauty',
    description: 'Complete beauty kit for college students including moisturizer, sunscreen, and basic makeup essentials.',
    rating: 4.5
  },
  {
    id: '2',
    name: 'Healthy Snack Box',
    price: 299,
    image: 'https://images.unsplash.com/photo-1603384699007-50799748fc1c',
    category: 'Food',
    description: 'Assorted healthy snacks perfect for study sessions.',
    rating: 4.8
  },
  // Add more products for each category
]; 