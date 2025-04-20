import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, Eye, EyeOff, Mail, Lock, User, Phone, Calendar, Store, Shield, MapPin, Bike } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/index';
import { auth, db } from '../lib/firebase';
import { createShopProfile } from '../services/shopService';
import { getDoc, doc, setDoc } from 'firebase/firestore';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  dateOfBirth: string;
  shopName?: string;
  shopAddress?: string;
  drivingLicenseNo?: string;
}

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    dateOfBirth: '',
    shopName: '',
    shopAddress: '',
    drivingLicenseNo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const location = useLocation();
  const from = (location.state as any)?.from || '/home';
  const [showAuthForm, setShowAuthForm] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');
    if (mode) {
      setShowForm(true);
      setIsSignUp(mode !== 'signin');
    }
    setIsRightPanelActive(mode !== 'signin');
  }, []);

  useEffect(() => {
    console.log('Current state:', { isSignUp, loading, error, showForm });
  }, [isSignUp, loading, error, showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (!selectedRole) {
          throw new Error('Please select a role');
        }
        await signUp(formData.email, formData.password, selectedRole);
        
        // Additional role-specific setup
        if (selectedRole === 'shopkeeper' && formData.shopName) {
          // Create shop profile in Firestore
          await createShopProfile({
            name: formData.shopName!,
            address: formData.shopAddress!,
            ownerId: auth.currentUser?.uid ?? '',
            rating: 0,
            deliveryTime: '30-40 min',
            image: '/images/shops/default.jpg',
            cuisine: 'General',
            priceForTwo: 0,
            promoted: false,
            offers: [],
            isActive: true
          });
        } else if (selectedRole === 'delivery') {
          // Create delivery man profile in Firestore
          const user = auth.currentUser;
          if (user) {
            await setDoc(doc(db, 'delivery_man', user.uid), {
              name: formData.fullName,
              email: formData.email,
              phone: formData.mobileNumber,
              driving_license_no: formData.drivingLicenseNo || '',
              current_duty: 'Available',
              admin_control: 'active',
              created_at: new Date(),
              updated_at: new Date(),
              del_man_id: user.uid
            });
          }
        }
      } else {
        await signIn(formData.email, formData.password);
      }
      
      // Get user role and redirect accordingly
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        switch(userData?.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'shopkeeper':
            navigate('/shop/dashboard');
            break;
          case 'student':
            navigate(from);
            break;
          case 'delivery':
            navigate('/delivery/dashboard');
            break;
          default:
            navigate('/home');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Background elements for artistic touch
  const CircleDecoration = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-300/20 blur-xl"></div>
      <div className="absolute top-1/4 -left-12 w-40 h-40 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-300/20 blur-lg"></div>
      <div className="absolute bottom-1/4 right-1/3 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-400/10 to-orange-300/10 blur-xl"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <CircleDecoration />
      
      {/* Floating background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full"
          animate={{ 
            y: [0, 15, 0], 
            x: [0, 10, 0] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full"
          animate={{ 
            y: [0, -20, 0], 
            x: [0, -15, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 10,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-white/5 rounded-full"
          animate={{ 
            y: [0, 25, 0], 
            x: [0, -20, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 12,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {!selectedRole ? (
          // Role Selection Screen with enhanced artistic elements
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-4xl relative overflow-hidden"
          >
            {/* Decorative header accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
            
            <motion.h1 
              className="text-4xl font-bold text-center mb-4 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome to Doorstep 
            </motion.h1>
            
            <motion.p 
              className="text-white/80 text-center mb-12 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Choose how you want to use the platform 
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Card - Enhanced */}
              <motion.button
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => {
                  setSelectedRole('student');
                  setShowAuthForm(true);
                }}
                className="bg-gradient-to-br from-blue-500/30 to-blue-700/30 rounded-2xl p-6 text-center
                         hover:shadow-lg transition-all border border-blue-400/30
                         hover:border-blue-400/80 cursor-pointer backdrop-blur-sm relative overflow-hidden group"
              >
                {/* Decorative hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/20 
                             group-hover:to-blue-600/20 transition-all duration-300"></div>
                
                <div className="bg-blue-500 text-white rounded-full w-20 h-20 flex items-center 
                            justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 relative z-10">
                  <User className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">Student</h3>
                <p className="text-blue-100/90 mb-4">
                  Order food and stationery items from campus shops
                </p>
                <ul className="text-sm text-blue-100/70 mt-4 space-y-2">
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                    Browse campus shops
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                    Place orders
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                    Track deliveries
                  </li>
                </ul>
              </motion.button>

              {/* Shop Owner Card - Enhanced */}
              <motion.button
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  setSelectedRole('shopkeeper');
                  setShowAuthForm(true);
                }}
                className="bg-gradient-to-br from-green-500/30 to-green-700/30 rounded-2xl p-6 text-center
                         hover:shadow-lg transition-all border border-green-400/30
                         hover:border-green-400/80 cursor-pointer backdrop-blur-sm relative overflow-hidden group"
              >
                {/* Decorative hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-600/0 group-hover:from-green-400/20 
                             group-hover:to-green-600/20 transition-all duration-300"></div>
                
                <div className="bg-green-500 text-white rounded-full w-20 h-20 flex items-center 
                            justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 relative z-10">
                  <Store className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">Shop Owner</h3>
                <p className="text-green-100/90 mb-4">
                  Manage your shop and fulfill orders
                </p>
                <ul className="text-sm text-green-100/70 mt-4 space-y-2">
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div>
                    Manage inventory
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div>
                    Handle orders
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div>
                    Track earnings
                  </li>
                </ul>
              </motion.button>

              {/* Delivery Man Card - Enhanced */}
              <motion.button
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => {
                  setSelectedRole('delivery');
                  setShowAuthForm(true);
                }}
                className="bg-gradient-to-br from-yellow-500/30 to-yellow-700/30 rounded-2xl p-6 text-center
                         hover:shadow-lg transition-all border border-yellow-400/30
                         hover:border-yellow-400/80 cursor-pointer backdrop-blur-sm relative overflow-hidden group"
              >
                {/* Decorative hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-yellow-600/0 group-hover:from-yellow-400/20 
                             group-hover:to-yellow-600/20 transition-all duration-300"></div>
                
                <div className="bg-yellow-500 text-white rounded-full w-20 h-20 flex items-center 
                            justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30 relative z-10">
                  <Bike className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">Delivery Partner</h3>
                <p className="text-yellow-100/90 mb-4">
                  Deliver orders and earn money
                </p>
                <ul className="text-sm text-yellow-100/70 mt-4 space-y-2">
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-300"></div>
                    Accept delivery requests
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-300"></div>
                    Track your earnings
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-300"></div>
                    Flexible working hours
                  </li>
                </ul>
              </motion.button>

              {/* Admin Card - Enhanced */}
              <motion.button
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={() => {
                  setSelectedRole('admin');
                  setShowAuthForm(true);
                }}
                className="bg-gradient-to-br from-purple-500/30 to-purple-700/30 rounded-2xl p-6 text-center
                         hover:shadow-lg transition-all border border-purple-400/30
                         hover:border-purple-400/80 cursor-pointer backdrop-blur-sm relative overflow-hidden group"
              >
                {/* Decorative hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-purple-600/0 group-hover:from-purple-400/20 
                             group-hover:to-purple-600/20 transition-all duration-300"></div>
                
                <div className="bg-purple-500 text-white rounded-full w-20 h-20 flex items-center 
                            justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30 relative z-10">
                  <Shield className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">Admin</h3>
                <p className="text-purple-100/90 mb-4">
                  Manage and oversee the platform
                </p>
                <ul className="text-sm text-purple-100/70 mt-4 space-y-2">
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-300"></div>
                    Manage users
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-300"></div>
                    Oversee operations
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-300"></div>
                    Handle approvals
                  </li>
                </ul>
              </motion.button>
            </div>

            <motion.p 
              className="text-center mt-10 text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Already have an account?{' '}
              <button
                onClick={() => setShowAuthForm(true)}
                className="text-blue-300 hover:text-blue-200 font-medium hover:underline transition-colors"
              >
                Sign In
              </button>
            </motion.p>
          </motion.div>
        ) : (
          // Auth Form (Sign In/Sign Up) - Enhanced
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20 relative overflow-hidden"
          >
            {/* Decorative header accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
            
            <div className="flex items-center mb-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSelectedRole(null);
                  setShowAuthForm(false);
                }}
                className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <h2 className="text-2xl font-bold ml-2 text-white">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
            </div>

            {/* Show selected role badge */}
            <div className="mb-6 flex items-center justify-center">
              <span className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm
                ${selectedRole === 'student' ? 'bg-blue-500/30 text-blue-50 border border-blue-400/30' :
                  selectedRole === 'shopkeeper' ? 'bg-green-500/30 text-green-50 border border-green-400/30' :
                  selectedRole === 'delivery' ? 'bg-yellow-500/30 text-yellow-50 border border-yellow-400/30' :
                  'bg-purple-500/30 text-purple-50 border border-purple-400/30'}`}>
                {selectedRole === 'student' ? 'Student Account' :
                 selectedRole === 'shopkeeper' ? 'Shop Owner Account' :
                 selectedRole === 'delivery' ? 'Delivery Partner Account' :
                 'Admin Account'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center justify-center flex-col space-y-4">
              <div className="relative w-full">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                           placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                           placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                           placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {selectedRole === 'shopkeeper' && (
                <div className="space-y-4 w-full">
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                    <input
                      type="text"
                      name="shopName"
                      placeholder="Shop Name"
                      className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                               placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                      value={formData.shopName || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                    <input
                      type="text"
                      name="shopAddress"
                      placeholder="Shop Address"
                      className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                               placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                      value={formData.shopAddress || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'delivery' && (
                <div className="space-y-4 w-full">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                    <input
                      type="text"
                      name="mobileNumber"
                      placeholder="Phone Number"
                      className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                               placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                    <input
                      type="text"
                      name="drivingLicenseNo"
                      placeholder="Driving License Number"
                      className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                               placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                      value={formData.drivingLicenseNo || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 text-center"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="rounded-lg border border-white/20 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm
                         font-bold py-3 px-8 uppercase tracking-wider shadow-lg shadow-purple-600/20
                         hover:shadow-xl hover:shadow-purple-600/30 transition-all w-full"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </motion.button>

              {!isSignUp && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <a href="/forgot-password" className="text-white/70 hover:text-white text-sm transition-colors">
                    Forgot Password?
                  </a>
                </motion.p>
              )}

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/70"
              >
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setIsSignUp(false); }}
                      className="text-blue-300 hover:text-blue-200 font-medium hover:underline transition-colors"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setIsSignUp(true); }}
                      className="text-blue-300 hover:text-blue-200 font-medium hover:underline transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </motion.p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}