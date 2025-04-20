import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FolderEdit, Trash2 } from 'lucide-react';
import type { Category, Product } from '../../types/types';

export default function EditCategory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;

      try {
        // Fetch category
        const categoryDoc = await getDoc(doc(db, 'categories', id));
        if (categoryDoc.exists()) {
          const category = categoryDoc.data() as Category;
          setFormData({
            name: category.name,
            description: category.description
          });
        }

        // Fetch products in this category
        const productsQuery = query(
          collection(db, 'products'),
          where('category', '==', id)
        );
        const productsSnapshot = await getDocs(productsQuery);
        setProducts(productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'categories', id), {
        name: formData.name,
        description: formData.description,
        updatedAt: new Date()
      });

      navigate('/shop/categories');
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (products.length > 0) {
      alert('Cannot delete category with existing products. Please move or delete the products first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category?')) return;
    if (!user || !id) return;

    try {
      await deleteDoc(doc(db, 'categories', id));
      navigate('/shop/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-full">
                <FolderEdit className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Edit Category</h1>
                <p className="text-white/80">Update category details</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            {products.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">
                  Products in this category
                </h3>
                <div className="space-y-2">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200"
                    >
                      <span>{product.name}</span>
                      <button
                        type="button"
                        onClick={() => navigate(`/shop/edit-product/${product.id}`)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm text-yellow-700">
                  You must move or delete these products before deleting this category.
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Category
              </button>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/shop/categories')}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 