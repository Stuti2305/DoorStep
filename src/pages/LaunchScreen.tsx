import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Package, Truck, ShoppingBag } from 'lucide-react';

export default function LaunchScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth?mode=signin');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 2, 2, 1, 1],
            rotate: [0, 0, 270, 270, 0],
          }}
          transition={{ repeat: Infinity, duration: 20 }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 2, 2, 1, 1],
            rotate: [270, 270, 0, 0, 270],
          }}
          transition={{ repeat: Infinity, duration: 15 }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-pink-400/30 to-red-400/30 blur-3xl"
        />
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1.5 
          }}
          className="flex flex-col items-center"
        >
          {/* Animated logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 mb-8"
          >
            <Heart className="w-full h-full text-white" strokeWidth={1.5} />
          </motion.div>

          {/* Text animations */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-white mb-4">BANASTHALI</h1>
            <h2 className="text-4xl font-bold text-white/90 mb-6">UNIVERSITY</h2>
            <h3 className="text-3xl font-bold text-white/80">DELIVERY</h3>
            <h4 className="text-3xl font-bold text-white/80">APP</h4>
          </motion.div>

          {/* Animated features */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex gap-8"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <Package className="w-8 h-8 text-white mb-2" />
              <span className="text-white/80 text-sm">Fast Delivery</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <Truck className="w-8 h-8 text-white mb-2" />
              <span className="text-white/80 text-sm">Track Orders</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <ShoppingBag className="w-8 h-8 text-white mb-2" />
              <span className="text-white/80 text-sm">Easy Shopping</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12"
        >
          <div className="flex gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}