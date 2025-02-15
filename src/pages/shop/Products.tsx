import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Clipboard } from 'lucide-react';
import { productService } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';
import type { Product } from '../../types';
import Layout from '../../components/Layout';
import { toast } from 'react-hot-toast';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.uid) return;
      try {
        const fetchedProducts = await productService.getProductsByShop(user.uid);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const handleAddProduct = async (productData: FormData) => {
    try {
      const product = {
        name: productData.get('name') as string,
        description: productData.get('description') as string,
        price: parseFloat(productData.get('price') as string),
        category: productData.get('category') as string,
        shopId: user!.uid,
        available: true,
        imageUrl: '/images/products/default.jpg' // Default image, or an empty string if preferred.
      };
  
      // Now call addProduct without an image file
      await productService.addProduct(product);
      // Refresh products list
      const updatedProducts = await productService.getProductsByShop(user!.uid);
      setProducts(updatedProducts);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };
  
  
  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} onEdit={() => {}} />
              ))}
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <AddProductModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddProduct}
          />
        )}
      </div>
    </Layout>
  );
}

function ProductCard({ product, onEdit }: { product: Product; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">₹{product.price}</span>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function AddProductModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: FormData) => Promise<void>; }) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // No image file is handled here.
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="food">Food</option>
              <option value="stationery">Stationery</option>
              <option value="books">Books</option>
              <option value="electronics">Electronics</option>
            </select>
          </div>
          {/* No file upload UI */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
