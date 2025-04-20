import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    try {
      setIsAdding(true);
      await addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        shopId: product.shopId
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  // Helper function to handle different image URL formats
  const getImageSrc = (url: string) => {
    if (!url) return '';
    // Check if the URL already starts with data:image or http
    return url.startsWith('data:image') || url.startsWith('http') 
      ? url 
      : `data:image/jpeg;base64,${url}`;
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative">
          <img
            src={getImageSrc(product.imageUrl)}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <button 
            onClick={(e) => e.preventDefault()}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 
                     backdrop-blur-sm hover:bg-white transition-colors"
          >
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-4">{product.description}</p>
        </div>
      </Link>
      
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">₹{product.price}</span>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                     rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
} 