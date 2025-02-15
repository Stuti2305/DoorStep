import { useState, useEffect, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import type { Product, Shop } from '../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function FoodPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [foodProducts, shopsSnapshot] = await Promise.all([
          productService.getProductsByCategory('food'),
          getDocs(collection(db, 'shops'))
        ]);

        setProducts(foodProducts);
        setShops(shopsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Shop[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesShop = selectedShop === 'all' || product.shopId === selectedShop;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesShop && matchesSearch && matchesPrice;
    });
  }, [products, selectedShop, searchQuery, priceRange]);

  return (
    <div className="min-h-screen bg-gradient-to-t from-gray-100 to-white pt-20">
      <div className="px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Food Items</h1>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Filter className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <SearchBar onSearch={setSearchQuery} placeholder="Search food items..." />

          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop</label>
                <select 
                  value={selectedShop}
                  onChange={(e) => setSelectedShop(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-300"
                >
                  <option value="all">All Shops</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-20 mt-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-xl" />
                <div className="bg-white p-4 rounded-b-xl">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-20 mt-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
} 