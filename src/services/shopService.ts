import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ShopProfile {
  name: string;
  address: string;
  ownerId: string | undefined;
  rating: number;
  deliveryTime: string;
  image: string;
  cuisine: string;
  priceForTwo: number;
  promoted: boolean;
  offers: string[];
  isActive: boolean;
}

export const createShopProfile = async (profile: ShopProfile) => {
  if (!profile.ownerId) throw new Error('Owner ID is required');
  await setDoc(doc(db, 'shops', profile.ownerId), {
    ...profile,
    rating: 0,
    deliveryTime: '30-40 min',
    image: '/images/shops/default.jpg',
    promoted: false,
    offers: [],
    isActive: true,
    createdAt: new Date()
  });
}; 