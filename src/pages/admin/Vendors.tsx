import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Store, ChevronDown, ChevronUp } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  image: string;
  ownerId: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stockQuantity: number;
  available: boolean;
}

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [expandedShop, setExpandedShop] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const shopsQuery = collection(db, 'shops');
        const shopsSnapshot = await getDocs(shopsQuery);
        const vendorsList = shopsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          image: doc.data().image || '/images/shops/default.jpg',
          ownerId: doc.data().ownerId
        }));
        setVendors(vendorsList);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const fetchProducts = async (shopId: string, ownerId: string) => {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('shopId', '==', ownerId)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        image: doc.data().image || '/images/products/default.jpg',
        description: doc.data().description,
        stockQuantity: doc.data().stockQuantity,
        available: doc.data().available
      }));
      setProducts(prev => ({ ...prev, [shopId]: productsList }));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleShopClick = (shopId: string, ownerId: string) => {
    if (expandedShop === shopId) {
      setExpandedShop(null);
    } else {
      setExpandedShop(shopId);
      if (!products[shopId]) {
        fetchProducts(shopId, ownerId);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendors</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => handleShopClick(vendor.id, vendor.ownerId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                    </div>
                  </div>
                  {expandedShop === vendor.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedShop === vendor.id && (
                <div className="border-t border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Products</h4>
                  {products[vendor.id] ? (
                    <div className="space-y-4">
                      {products[vendor.id].map((product) => (
                        <div key={product.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{product.name}</h5>
                            <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">₹{product.price}</span>
                              <span className={`text-sm ${product.available ? 'text-green-600' : 'text-red-600'}`}>
                                {product.available ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="mt-1">
                              <span className="text-xs text-gray-500">
                                Stock: {product.stockQuantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 