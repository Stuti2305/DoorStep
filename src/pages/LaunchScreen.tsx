import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Package, Truck, ShoppingBag, Map, Clock } from 'lucide-react';

export default function LaunchScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth?mode=signin');
    }, 6000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  // Particles for background animation
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 10 + 5,
    duration: Math.random() * 15 + 10
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 0.8, 1.2],
            rotate: [0, -180, -360],
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-red-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main content */}
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
          {/* Animated logo container */}
          <motion.div
            className="relative w-40 h-40 mb-8"
          >
            {/* Core logo with pulse effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Heart className="w-full h-full text-white" strokeWidth={1.5} />
            </motion.div>
            
            {/* Orbiting elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Package className="w-8 h-8 text-white/80" />
              </motion.div>
              <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <Truck className="w-8 h-8 text-white/80" />
              </motion.div>
              <motion.div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <ShoppingBag className="w-8 h-8 text-white/80" />
              </motion.div>
              <motion.div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                <Map className="w-8 h-8 text-white/80" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Text animations with staggered reveal */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            {/* Main title with glowing effect */}
            <motion.h1 
              className="text-6xl font-bold text-white mb-6 relative"
              animate={{ textShadow: ["0 0 8px rgba(255,255,255,0.5)", "0 0 16px rgba(255,255,255,0.8)", "0 0 8px rgba(255,255,255,0.5)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              DOORSTEP
            </motion.h1>
            
            {/* Animated typing effect for subtitle */}
            <motion.div className="overflow-hidden h-12 mb-4">
              <motion.h2 
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-3xl font-bold text-white/90"
              >
                BANASTHALI UNIVERSITY
              </motion.h2>
            </motion.div>
            
            {/* Split text animation */}
            <div className="flex justify-center gap-4 mb-4">
              <motion.h3 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-3xl font-bold text-white/80"
              >
                DELIVERY
              </motion.h3>
              <motion.h4 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-3xl font-bold text-white/80"
              >
                APPLICATION
              </motion.h4>
            </div>
          </motion.div>

          {/* Animated features with hover effects */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-12 flex gap-6"
          >
            {[
              { icon: Package, text: "Campus Delivery" },
              { icon: Truck, text: "Track Orders" },
              { icon: ShoppingBag, text: "Easy Shopping" },
              { icon: Clock, text: "Quick Service" },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ 
                  scale: 1.1, 
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)"
                }}
                className="flex flex-col items-center p-3 rounded-lg backdrop-blur-sm"
              >
                <motion.div
                  whileHover={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon className="w-8 h-8 text-white mb-2" />
                </motion.div>
                <span className="text-white/90 text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-12"
        >
          <motion.div 
            className="px-6 py-2 rounded-full backdrop-blur-md bg-white/10 flex items-center gap-3"
          >
            <motion.div
              animate={{ 
                width: ["0%", "100%", "0%"],
                x: ["-50%", "0%", "50%"]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut" 
              }}
              className="h-1 w-12 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"
            />
            <span className="text-white text-xs font-medium">Loading</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}