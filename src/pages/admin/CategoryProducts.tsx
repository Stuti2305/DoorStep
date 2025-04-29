import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  available: boolean;
}

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // Fetch category name
        const categoryDoc = await getDocs(query(collection(db, 'categories'), where('id', '==', categoryId)));
        if (!categoryDoc.empty) {
          setCategoryName(categoryDoc.docs[0].data().name);
        }

        // Fetch products for this category
        const productsQuery = query(
          collection(db, 'products'),
          where('category', '==', categoryId)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching category products:', error);
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link to="/admin/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{categoryName} Products</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <p className="text-xl font-semibold text-gray-900 mt-2">₹{product.price}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-sm ${product.available ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {product.available ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stockQuantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 