import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FolderOpen, ChevronRight, Package } from 'lucide-react';
import type { Category, Product } from '../../types/types';

export default function Categories() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch categories
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('shopId', '==', user.uid)
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const fetchedCategories = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(fetchedCategories);

        // Fetch products for each category
        const productsQuery = query(
          collection(db, 'products'),
          where('shopId', '==', user.uid)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const allProducts = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];

        // Group products by category
        const productsByCategory = allProducts.reduce((acc, product) => {
          const categoryId = product.category;
          if (!acc[categoryId]) {
            acc[categoryId] = [];
          }
          acc[categoryId].push(product);
          return acc;
        }, {} as Record<string, Product[]>);

        setProducts(productsByCategory);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600">Manage your product categories</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/shop/add-category')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Categories List */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">All Categories</h2>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{category.name}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Products List */}
          <div className="md:col-span-2">
            {selectedCategory ? (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {categories.find(c => c.id === selectedCategory)?.name} Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products[selectedCategory]?.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-16 h-16">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-gray-600">₹{product.price}</p>
                        <span className={`text-sm ${
                          product.available
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {product.available ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/shop/edit-product/${product.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                  {!products[selectedCategory]?.length && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No products in this category</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Select a category to view its products</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 