import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, ShoppingCart, Star, Minus, Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Product } from '../types/types';
import { toast } from 'react-hot-toast';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const productDoc = await getDoc(doc(db, 'products', id));
        if (productDoc.exists()) {
          setProduct({
            id: productDoc.id,
            ...productDoc.data(),
            createdAt: productDoc.data().createdAt?.toDate(),
            updatedAt: productDoc.data().updatedAt?.toDate(),
          } as Product);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800">Product not found</h1>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imageUrl,
        shopId: product.shopId
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Product Image */}
      <div className="relative h-72 sm:h-96">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg">
          <Heart className="w-6 h-6 text-pink-500" />
        </button>
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            <div className="flex items-center mt-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="ml-1 text-gray-600">{product.rating}</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{product.price}</p>
        </div>

        <p className="mt-4 text-gray-600">{product.description}</p>

        {/* Quantity Selector */}
        <div className="flex items-center mt-6">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="p-2 rounded-full border border-gray-300"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="mx-4 text-lg font-semibold">{quantity}</span>
          <button 
            onClick={() => setQuantity(q => q + 1)}
            className="p-2 rounded-full border border-gray-300"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full 
                   font-semibold flex items-center justify-center space-x-2 hover:opacity-90 
                   transition-opacity disabled:opacity-50"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
} 