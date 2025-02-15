import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';

export default function StationeryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const stationeryProducts = await productService.getProductsByCategory('stationery');
        setProducts(stationeryProducts);
      } catch (error) {
        console.error('Error fetching stationery products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    p => p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-gray-100 to-white pt-20">
      <div className="px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Stationery Items</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input 
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-32"
              />
              <span>₹{priceRange[1]}</span>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Filter className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
} 