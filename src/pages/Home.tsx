import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Star, Clock, Filter, MapPin } from 'lucide-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useDebounce } from '../hooks/useDebounce';
import {Shop, Category} from '../types/types'

// interface Category {
//   id: string;
//   name: string;
//   image: string;
//   color: string;
// }

// interface Shop {
//   id: string;
//   name: string;
//   rating: number;
//   deliveryTime: string;
//   image: string;
//   cuisine: string;
//   priceForTwo: number;
//   promoted: boolean;
//   offers: string[];
// }

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [location, setLocation] = useState('Banasthali Campus');
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const categories: Category[] = [
    {
      id: 'stationery',
      slug: 'stationery',
      description: 'Stationery items for your academic needs',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Stationery',
      image: '/images/categories/stationery.jpg',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'food',
      name: 'Food',
      slug: 'food',
      description: 'Delicious food options available',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      image: '/images/categories/food.jpg',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'books',
      name: 'Books',
      slug: 'books',
      description: 'Books for your academic and leisure reading',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      image: '/images/categories/books.jpg',
      color: 'from-green-500 to-teal-500',
    },
    {
      id: 'electronics',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronics and gadgets for your tech needs',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // image: '/images/categories/electronics.jpg',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      // image: '/images/categories/electronics.jpg',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'daily-essentials',
      name: 'Daily Essentials',
      slug: 'daily-essentials',
      description: 'Daily essentials for your convenience',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // image: '/images/categories/essentials.jpg',
      image: 'https://images.unsplash.com/photo-1603052875003-4e1f8b6f7c9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      // image: '/images/categories/essentials.jpg',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopsQuery = query(collection(db, 'shops'));
        const snapshot = await getDocs(shopsQuery);
        const fetchedShops = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Shop[];
        setShops(fetchedShops);
        setFilteredShops(fetchedShops);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setFilteredShops(shops);
      return;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    const filtered = shops.filter((shop) =>
      shop.name.toLowerCase().includes(query) ||
      shop.cuisine.toLowerCase().includes(query) ||
      shop.offers.some((offer) => offer.toLowerCase().includes(query))
    );
    setFilteredShops(filtered);
  }, [debouncedSearchQuery, shops]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button className="flex items-center space-x-2 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{location}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for shops on the campus"
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">What's on your mind?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* {categories.map((category) => (
            <Link key={category.id} to={`/category/${category.id}`}>
              <motion.div whileHover={{ y: -5 }} className="relative rounded-2xl overflow-hidden aspect-square shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80`} />
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{category.name}</span>
                </div>
              </motion.div>
            </Link>
          ))} */}
         {categories.map((category) => (
  <Link key={category.id} to={`/category/${category.id}`}>
    <motion.div whileHover={{ y: -5 }} className="relative rounded-2xl overflow-hidden aspect-square shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80`} />
      <img
        src={`data:image/jpeg;base64,${category.image}`}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-semibold text-lg">{category.name}</span>
      </div>
    </motion.div>
  </Link>
))}
        </div>
      </div>

      <div className="sticky top-16 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full border hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <button
                onClick={() => setSelectedSort('rating')}
                className={`px-4 py-2 rounded-full border transition-colors ${selectedSort === 'rating' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
              >
                Rating 4.0+
              </button>
              <button
                onClick={() => setSelectedSort('fastest')}
                className={`px-4 py-2 rounded-full border transition-colors ${selectedSort === 'fastest' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
              >
                Fastest Delivery
              </button>
            </div>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Rating</option>
              <option value="delivery-time">Delivery Time</option>
              <option value="cost-low">Cost: Low to High</option>
              <option value="cost-high">Cost: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Discover the shops on the campus</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Link key={shop.id} to={`/shops/${shop.id}`}>
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img src={`data:image/jpeg;base64,${shop.imageUrl}`} alt={shop.name} className="w-full h-48 object-cover" />

                    {shop.promoted && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-sm">
                        Promoted
                      </div>
                    )}
                    {shop.offers && shop.offers.length > 0 && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="text-white text-sm font-medium">
                          {shop.offers[0]}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{shop.name}</h3>
                      <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded">
                        <span>{shop.rating}</span>
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                    <div className="text-gray-600 text-sm mb-2">{shop.cuisine}</div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{shop.deliveryTime}</span>
                      </div>
                      <div>₹{shop.priceForTwo} for two</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-gray-500 text-lg mb-2">No shops found</div>
          </div>
        )}
      </div>
    </div>
  );
}