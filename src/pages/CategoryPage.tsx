import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChevronLeft, Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';

export default function CategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log('Fetching products for category:', category);
      if (!category) {
        console.error('No category provided');
        setError('No category specified');
        setLoading(false);
        return;
      }

      try {
        console.log('Querying Firestore for products in category:', category);
        const q = query(
          collection(db, 'products'),
          where('category', '==', category),
          where('available', '==', true)
        );

        const snapshot = await getDocs(q);
        console.log(`Found ${snapshot.docs.length} products in category ${category}`);
        
        const fetchedProducts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || null,
            updatedAt: data.updatedAt?.toDate?.() || null,
          };
        }) as Product[];

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold">{error}</div>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-t from-gray-100 to-white">
        <div className="px-4 max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <button onClick={() => window.history.back()} className="mr-3">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{category}</h1>
          </div>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">No products found in this category</h2>
            <p className="text-gray-500 mt-2">Try a different category or check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-gray-100 to-white pt-20">
      <div className="px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={() => window.history.back()} className="mr-3">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{category}</h1>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Filter className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
