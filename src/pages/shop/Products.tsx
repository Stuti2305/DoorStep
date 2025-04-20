import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Store, Upload, ArrowLeft, ShoppingBag } from 'lucide-react';
import { db, storage } from '../../lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';
import type { Product, Category } from '../../types/types';
import Layout from '../../components/Layout';
import { toast } from 'react-hot-toast';

export default function Products() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;
      try {
        // Fetch products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = productsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];
        
        // Filter by shop if needed
        const shopProducts = fetchedProducts.filter(product => product.shopId === user.uid);
        setProducts(shopProducts);
        
        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        setCategories(categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleAddProduct = async (productData: FormData, imageFile: File | null) => {
    if (!user) return;
    
    try {
      let imageUrl = '/images/products/default.jpg'; // Default image
      
      if (imageFile) {
        const storageRef = ref(storage, `products/${user.uid}/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Add product to Firestore
      const newProduct = {
        name: productData.get('name') as string,
        description: productData.get('description') as string,
        price: parseFloat(productData.get('price') as string),
        category: productData.get('category') as string,
        imageUrl,
        shopId: user.uid,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      
      // Add the new product to state
      setProducts(prev => [...prev, { ...newProduct, id: docRef.id }]);
      setShowAddModal(false);
      toast.success('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setViewMode('detail');
    window.scrollTo(0, 0);
  };

  const backToGrid = () => {
    setSelectedProduct(null);
    setViewMode('grid');
  };

  const getFilteredProducts = () => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.description.toLowerCase().includes(query)
    );
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {viewMode === 'grid' ? (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Your Products</h1>
                  <p className="text-gray-600 mt-1">Manage your product inventory</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                          hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add Product
                </button>
              </div>

              {/* Search and Filters */}
              <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products by name or description..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
                </div>
              ) : getFilteredProducts().length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getFilteredProducts().map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product}
                      onView={() => viewProductDetails(product)}
                      categoryName={getCategoryName(product.category)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchQuery ? 'Try a different search term' : 'Start by adding your first product'}
                  </p>
                  {!searchQuery && (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                        Add Product
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <ProductDetail 
              product={selectedProduct!} 
              onBack={backToGrid}
              categoryName={getCategoryName(selectedProduct?.category || '')}
            />
          )}
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <AddProductModal
            categories={categories}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddProduct}
          />
        )}
      </div>
    </Layout>
  );
}

function ProductCard({ 
  product, 
  onView,
  categoryName
}: { 
  product: Product; 
  onView: () => void;
  categoryName: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {!product.available && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1">
            Out of Stock
          </div>
        )}
        <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs font-bold px-3 py-1">
          {categoryName}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
          <div className="flex space-x-2">
            <Link to={`/shop/edit-product/${product.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Edit
            </Link>
            <button
              onClick={onView}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ 
  product, 
  onBack,
  categoryName
}: { 
  product: Product; 
  onBack: () => void;
  categoryName: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex items-center">
        <button
          onClick={onBack}
          className="mr-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
      </div>
      
      <div className="md:flex">
        <div className="md:w-1/3 p-6">
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>
          
          <div className="mt-6 flex justify-between">
            <Link
              to={`/shop/edit-product/${product.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center w-full mr-2"
            >
              Edit Product
            </Link>
            
            <button
              className={`px-4 py-2 rounded-lg transition-colors text-center w-full ml-2 ${
                product.available
                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {product.available ? 'Mark Unavailable' : 'Mark Available'}
            </button>
          </div>
        </div>
        
        <div className="md:w-2/3 p-6 md:border-l">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {categoryName}
              </span>
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.available ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-4">₹{product.price.toFixed(2)}</p>
            <div className="prose max-w-none text-gray-600">
              <p>{product.description}</p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Product Information</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.id}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{categoryName}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.available ? 'Available' : 'Unavailable'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.updatedAt ? new Date(product.updatedAt* 1000).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddProductModal({ 
  categories,
  onClose, 
  onSubmit 
}: { 
  categories: Category[];
  onClose: () => void; 
  onSubmit: (data: FormData, imageFile: File | null) => Promise<void>; 
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Handle image selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await onSubmit(formData, imageFile);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Add New Product</h1>
              <p className="text-white/80 text-sm">Create a new product listing</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                required
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
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