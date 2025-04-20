import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Category } from '../types/types';
import { ChevronLeft, Star } from 'lucide-react';

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch category details
        const categoryDoc = await getDocs(
          query(collection(db, 'categories'), where('id', '==', categoryId))
        );
        
        if (!categoryDoc.empty) {
          const categoryData = categoryDoc.docs[0].data() as Category;
          setCategory(categoryData);
        }
        
        // Fetch products for this category
        const productsQuery = query(
          collection(db, 'products'), 
          where('category', '==', categoryId),
          where('available', '==', true)
        );
        
        const productsSnapshot = await getDocs(productsQuery);
        const productList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryAndProducts();
    }
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className={`bg-gradient-to-r ${category?.color || 'from-purple-600 to-indigo-600'} text-white`}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-white/80 mb-4">
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold mt-4">{category?.name || 'Category'}</h1>
          <p className="mt-2">{category?.description || 'Loading category details...'}</p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : products.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Products in {category?.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/shop/${product.shopId}`}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative">
                      <img 
                        src={`data:image/jpeg;base64,${product.imageUrl}`} 
                        alt={product.name} 
                        className="w-full h-48 object-cover" 
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        {product.rating && (
                          <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded">
                            <span>{product.rating}</span>
                            <Star className="w-4 h-4 fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="text-gray-600 text-sm mb-2">{product.description}</div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-semibold">₹{product.price}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-gray-500 text-lg mb-2">No products found in this category</div>
            <Link to="/" className="text-blue-600 hover:underline">
              Return to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}