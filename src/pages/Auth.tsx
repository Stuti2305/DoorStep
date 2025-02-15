import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, Eye, EyeOff, Mail, Lock, User, Phone, Calendar, Store, Shield, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/index';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { createShopProfile } from '../services/shopService';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  dateOfBirth: string;
  shopName?: string;
  shopAddress?: string;
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
    shopAddress: ''
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!selectedRole ? (
          // Role Selection Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl"
          >
            <h1 className="text-3xl font-bold text-center mb-8">Welcome to Campus Delivery</h1>
            <p className="text-gray-600 text-center mb-12">Choose how you want to use the platform</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Student Card */}
              <motion.button
                whileHover={{ y: -5 }}
                onClick={() => {
                  setSelectedRole('student');
                  setShowAuthForm(true);
                }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center
                         hover:shadow-lg transition-all border-2 border-transparent
                         hover:border-blue-200 cursor-pointer"
              >
                <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center 
                            justify-center mx-auto mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Student</h3>
                <p className="text-gray-600 text-sm">
                  Order food and stationery items from campus shops
                </p>
                <ul className="text-sm text-gray-500 mt-4 space-y-2">
                  <li>• Browse campus shops</li>
                  <li>• Place orders</li>
                  <li>• Track deliveries</li>
                </ul>
              </motion.button>

              {/* Shop Owner Card */}
              <motion.button
                whileHover={{ y: -5 }}
                onClick={() => {
                  setSelectedRole('shopkeeper');
                  setShowAuthForm(true);
                }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center
                         hover:shadow-lg transition-all border-2 border-transparent
                         hover:border-green-200 cursor-pointer"
              >
                <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center 
                            justify-center mx-auto mb-4">
                  <Store className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Shop Owner</h3>
                <p className="text-gray-600 text-sm">
                  Manage your shop and fulfill orders
                </p>
                <ul className="text-sm text-gray-500 mt-4 space-y-2">
                  <li>• Manage inventory</li>
                  <li>• Handle orders</li>
                  <li>• Track earnings</li>
                </ul>
              </motion.button>

              {/* Admin Card */}
              <motion.button
                whileHover={{ y: -5 }}
                onClick={() => {
                  setSelectedRole('admin');
                  setShowAuthForm(true);
                }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center
                         hover:shadow-lg transition-all border-2 border-transparent
                         hover:border-purple-200 cursor-pointer"
              >
                <div className="bg-purple-500 text-white rounded-full w-16 h-16 flex items-center 
                            justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Admin</h3>
                <p className="text-gray-600 text-sm">
                  Manage and oversee the platform
                </p>
                <ul className="text-sm text-gray-500 mt-4 space-y-2">
                  <li>• Manage users</li>
                  <li>• Oversee operations</li>
                  <li>• Handle approvals</li>
                </ul>
              </motion.button>
            </div>

            <p className="text-center mt-8 text-gray-500">
              Already have an account?{' '}
              <button
                onClick={() => setShowAuthForm(true)}
                className="text-blue-500 hover:underline"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        ) : (
          // Auth Form (Sign In/Sign Up)
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
          >
            <div className="flex items-center mb-8">
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setShowAuthForm(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold ml-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
            </div>

            {/* Show selected role badge */}
            <div className="mb-6 flex items-center justify-center">
              <span className={`px-4 py-2 rounded-full text-sm font-medium
                ${selectedRole === 'student' ? 'bg-blue-100 text-blue-800' :
                  selectedRole === 'shopkeeper' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'}`}>
                {selectedRole === 'student' ? 'Student Account' :
                 selectedRole === 'shopkeeper' ? 'Shop Owner Account' :
                 'Admin Account'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center justify-center flex-col">
              <div className="relative w-full mb-4">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="bg-[#eee] border-none p-[12px_15px] pl-10 m-[8px_0] w-full"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="bg-[#eee] border-none p-[12px_15px] pl-10 m-[8px_0] w-full"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  className="bg-[#eee] border-none p-[12px_15px] pl-10 m-[8px_0] w-full"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {selectedRole === 'shopkeeper' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="shopName"
                      placeholder="Shop Name"
                      className="bg-[#eee] border-none p-[12px_15px] pl-10 m-[8px_0] w-full"
                      value={formData.shopName || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="shopAddress"
                      placeholder="Shop Address"
                      className="bg-[#eee] border-none p-[12px_15px] pl-10 m-[8px_0] w-full"
                      value={formData.shopAddress || ''}
                      onChange={handleChange}
                      required
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

              <button
                type="submit"
                className="rounded-[20px] border border-[#FF4B2B] bg-[#FF4B2B] text-white text-[12px] 
                         font-bold py-3 px-[45px] uppercase tracking-[1px] transition-transform
                         hover:opacity-90 active:scale-95"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>

              {!isSignUp && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <a href="/forgot-password" className="text-gray-400 hover:text-gray-500 text-sm">
                    Forgot Password?
                  </a>
                </motion.p>
              )}

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400"
              >
                {isSignUp ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setIsSignUp(true); }}
                      className="text-gray-400 font-semibold hover:underline"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setIsSignUp(true); }}
                      className="text-gray-400 font-semibold hover:underline"
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