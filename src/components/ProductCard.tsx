import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Plus, Minus } from 'lucide-react';
import type { Product } from '../types/types';
import { useCart } from '../contexts/CartContext'; // Assuming you have a cart context
import type { CartItem } from '../types/types';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export default function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Assuming you have a cart context with these functions
  // If not, you'll need to implement them
  const { addToCart, removeFromCart, getQuantity } = useCart?.() || {
    addToCart: () => console.log("Add to cart clicked"),
    removeFromCart: () => console.log("Remove from cart clicked"),
    getQuantity: () => 0
  };
  function productToCartItem(product: Product): CartItem {
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      shopId: product.shopId,
    };
  }
  
  
  const quantity = getQuantity?.(product.id) || 0;

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart?.(productToCartItem(product));
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromCart?.(product.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      whileHover={{ y: -5 }}
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl || `/api/placeholder/300/300`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        
        {/* Favorite Button */}
        <button
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
          } hover:bg-red-500 hover:text-white transition-colors`}
          onClick={handleToggleFavorite}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        
        {/* Availability Badge */}
        {!product.available && (
          <div className="absolute bottom-0 inset-x-0 bg-gray-800/80 text-white text-center py-1 text-sm">
            Out of Stock
          </div>
        )}
        
        {/* Rating Badge (if available) */}
        {product.rating && (
          <div className="absolute top-2 left-2 bg-white/80 text-gray-800 rounded-full px-2 py-1 text-xs flex items-center">
            <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      {/* Product Details */}
      <div className="p-3">
        <h3 className="font-medium text-gray-800 line-clamp-1">{product.name}</h3>
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-purple-700 font-semibold">₹{product.price.toFixed(2)}</div>
          
          {/* Add to Cart Actions */}
          {showAddToCart && product.available && (
            quantity > 0 ? (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800"
                  onClick={handleRemoveFromCart}
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                
                <span className="font-medium text-gray-800">{quantity}</span>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                  onClick={handleAddToCart}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}