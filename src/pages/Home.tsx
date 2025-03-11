import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Star, Clock, Filter, MapPin, X } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Category {
  id: string;
  name: string;
  image: string;
  color: string;
}

interface Shop {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  image: string;
  cuisine: string;
  priceForTwo: number;
  promoted: boolean;
  offers: string[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [location, setLocation] = useState('Banasthali Campus');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);

  // Sample categories data
  const categories: Category[] = [
    {
      id: 'stationery',
      name: 'Stationery',
      image: '/images/categories/stationery.jpg',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'food',
      name: 'Food',
      image: '/images/categories/food.jpg',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'books',
      name: 'books',
      image: '/images/categories/stationery.jpg',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'electronics',
      name: ' electronics',
      image: '/images/categories/food.jpg',
      color: 'from-orange-500 to-red-500',
    },
    // Add more categories if needed...
  ];

  // Fetch shops from Firebase Firestore
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
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center space-x-2 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
            >
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
              placeholder="Search for shops, items or categories"
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-800 
                         focus:outline-none focus:ring-2 focus:ring-white/50 transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">What's on your mind?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.id} to={`/category/${category.id}`}>
              <motion.div
                whileHover={{ y: -5 }}
                className="relative rounded-2xl overflow-hidden aspect-square shadow-lg"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80`}
                />
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {category.name}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Filters and Sort */}
      <div className="sticky top-16 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full border 
                           hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <button
                onClick={() => setSelectedSort('rating')}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  selectedSort === 'rating'
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                Rating 4.0+
              </button>
              <button
                onClick={() => setSelectedSort('fastest')}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  selectedSort === 'fastest'
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                Fastest Delivery
              </button>
            </div>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 
                         focus:ring-purple-500"
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
      
      {/* Shops Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Discover the shops on the campus</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} to={`/shop/${shop.id}`}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl 
                             transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-48 object-cover"
                    />
                    {shop.promoted && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 
                                      to-blue-700 text-white px-3 py-1 rounded-full text-sm">
                        Promoted
                      </div>
                    )}
                    {shop.offers && shop.offers.length > 0 && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t 
                                      from-black/60 to-transparent p-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-white text-sm font-medium">
                            {shop.offers[0]}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{shop.name}</h3>
                      <div className="flex items-center space-x-1 bg-green-500 text-white 
                                      px-2 py-1 rounded">
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
        )}
      </div>

      {/* Location Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Select Location</h2>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Add location selection UI here */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}