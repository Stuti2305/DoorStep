import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Eye, EyeOff, Mail, Lock, User, Phone, Store, Shield, Bike, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/index';
import { auth, db } from '../lib/firebase';
import { createShopProfile } from '../services/shopService';
import { getDoc, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  userId: string;
  shopName?: string;
  shopAddress?: string;
  drivingLicenseNo?: string;
}

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    userId: '',
    shopName: '',
    shopAddress: '',
    drivingLicenseNo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const location = useLocation();
  const from = (location.state as any)?.from || '/home';

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');
    if (mode) {
      setIsSignUp(mode !== 'signin');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    if (isSignUp) {
      if (!selectedRole) {
        setError('Please select a role');
        return;
      }

      if (!formData.fullName) {
        setError('Please enter your full name');
        return;
      }

      if (!formData.mobileNumber || !/^\d{10}$/.test(formData.mobileNumber)) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }

      if (!formData.userId) {
        setError('Please enter your ID');
        return;
      }

      // Student/Vendor ID validation (5 uppercase + 5 digits)
      if ((selectedRole === 'student' || selectedRole === 'shopkeeper') && 
          !/^[A-Z]{5}\d{5}$/.test(formData.userId)) {
        setError('ID must be 10 characters: First 5 uppercase letters, last 5 digits (e.g., ABCDE12345)');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (selectedRole === 'shopkeeper' && !formData.shopName) {
        setError('Please enter your shop name');
        return;
      }

      // Ensure selectedRole is not null before calling signUp
      if (selectedRole) {
        const userCredential = await signUp(formData.email, formData.password, selectedRole);
        const user = userCredential.user;
        
        if (!user) throw new Error('User creation failed');
        
        // Create role-specific profile in Firestore
        switch(selectedRole) {
          case 'student':
            await setDoc(doc(db, 'Students', user.uid), {
              stuname: formData.fullName,
              stuemail: formData.email,
              stuphno: formData.mobileNumber,
              stuid: formData.userId,
              userType: 'Student',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
            
          case 'admin':
            await setDoc(doc(db, 'Admins', user.uid), {
              name: formData.fullName,
              email: formData.email,
              phone_number: formData.mobileNumber,
              admin_id: formData.userId,
              userType: 'Admin',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;

          case 'shopkeeper':
            // First create vendor profile
            await setDoc(doc(db, 'onboarding_requests', user.uid), {
              vendorName: formData.fullName,
              vendorEmail: formData.email,
              vendorPhone: formData.mobileNumber,
              vendorId: formData.userId,
              shopName: formData.shopName,
              shopAddress: formData.shopAddress,
              userType: 'Vendor',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            
            // Then create shop profile if shop details provided
            if (formData.shopName) {
              try {
                await createShopProfile({
                  name: formData.shopName,
                  address: formData.shopAddress || '',
                  ownerId: user.uid,
                  rating: 0,
                  deliveryTime: '30-40 min',
                  image: '/images/shops/default.jpg',
                  cuisine: 'General',
                  priceForTwo: 0,
                  promoted: false,
                  offers: [],
                  isActive: false
                });
                toast.success('Shop profile created successfully!');
              } catch (shopError) {
                console.error('Shop profile creation error:', shopError);
                toast.error('Vendor account created but shop profile creation failed');
              }
            }
            break;

          case 'delivery':
            // Write delivery-specific data to onboarding_requests
            await setDoc(doc(db, 'onboarding_requests', user.uid), {
              name: formData.fullName,
              email: formData.email,
              phone: formData.mobileNumber,
              driving_license_no: formData.drivingLicenseNo || '',
              del_man_id: user.uid,
              userType: 'Delivery',
              current_duty: 'Available',
              admin_control: 'inactive',
              created_at: serverTimestamp(),
              updated_at: serverTimestamp()
            });
            break;
        }

        toast.success('Account created successfully!');
        navigate('/pending-approval'); // Redirect to pending approval page
      }
    } else {
      await signIn(formData.email, formData.password);
    }
    
    // Redirect based on role
    const user = auth.currentUser;
    if (user) {
      let userData = null;
      let userType = null;
      
      // Check each collection for user data
      const collections = [
        { name: 'Students', typeField: 'userType' },
        { name: 'Admins', typeField: 'userType' },
        { name: 'onboarding_requests', typeField: 'userType' }, // Include onboarding_requests for vendors and delivery
        { name: 'Vendors', typeField: 'userType' },
        { name: 'delivery_man', typeField: 'userType' }
      ];
      
      for (const collection of collections) {
        const docRef = doc(db, collection.name, user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          userData = docSnap.data();
          userType = userData[collection.typeField] || 'Unknown'; // Default to 'Unknown' if undefined
          console.log('Retrieved user data:', userData); // Debugging statement
          console.log('Determined user type:', userType); // Debugging statement
          break;
        }
      }
      
      if (!userData) {
        console.error('User data not found in collections:', collections.map(c => c.name));
        throw new Error('User data not found. Please try signing up again.');
      }
      
      // Handle navigation based on user type
      if (userType) {
        switch(userType) {
          case 'Student':
            navigate(from);
            break;
          case 'Vendor':
            navigate('/shop/dashboard');
            break;
          case 'Delivery':
            navigate('/delivery/dashboard');
            break;
          case 'Admin':
            navigate('/admin/dashboard');
            break;
          default:
            console.error('Unknown or null user type:', userType);
            navigate('/home'); // Redirect to a default page if userType is null or unknown
        }
      } else {
        console.error('User type is null or undefined');
        navigate('/home'); // Redirect to a default page if userType is null
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  // Function to check if user is approved
  async function checkApproval(userId: string, role: UserRole) {
    let isApproved = false;
    if (role === 'shopkeeper') {
      const vendorDoc = await getDoc(doc(db, 'Vendors', userId));
      isApproved = vendorDoc.exists();
    } else if (role === 'delivery') {
      const deliveryDoc = await getDoc(doc(db, 'delivery_man', userId));
      isApproved = deliveryDoc.exists();
    }
    return isApproved;
  }

  // Example usage in a dashboard component
  useEffect(() => {
    const user = auth.currentUser;
    if (user && selectedRole) {
      checkApproval(user.uid, selectedRole).then(isApproved => {
        if (!isApproved) {
          navigate('/pending-approval');
        }
      });
    }
  }, [selectedRole]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600 flex items-center justify-center p-4">
      <ToastContainer position="bottom-right" />
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold ml-2 text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
        </div>

        {isSignUp && !selectedRole && (
          <div className="mb-6 space-y-4">
            <h3 className="text-white text-center mb-4">Select your role</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleRoleSelect('student')}
                className="bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/30 rounded-lg p-4 text-white transition-colors"
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <span>Student</span>
              </button>
              <button
                onClick={() => handleRoleSelect('shopkeeper')}
                className="bg-green-500/30 hover:bg-green-500/40 border border-green-400/30 rounded-lg p-4 text-white transition-colors"
              >
                <Store className="w-6 h-6 mx-auto mb-2" />
                <span>Vendor</span>
              </button>
              <button
                onClick={() => handleRoleSelect('delivery')}
                className="bg-yellow-500/30 hover:bg-yellow-500/40 border border-yellow-400/30 rounded-lg p-4 text-white transition-colors"
              >
                <Bike className="w-6 h-6 mx-auto mb-2" />
                <span>Delivery</span>
              </button>
              <button
                onClick={() => handleRoleSelect('admin')}
                className="bg-purple-500/30 hover:bg-purple-500/40 border border-purple-400/30 rounded-lg p-4 text-white transition-colors"
              >
                <Shield className="w-6 h-6 mx-auto mb-2" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}

        {selectedRole && isSignUp && (
          <div className="mb-4 flex items-center justify-center">
            <span className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm
              ${selectedRole === 'student' ? 'bg-blue-500/30 text-blue-50 border border-blue-400/30' :
                selectedRole === 'shopkeeper' ? 'bg-green-500/30 text-green-50 border border-green-400/30' :
                selectedRole === 'delivery' ? 'bg-yellow-500/30 text-yellow-50 border border-yellow-400/30' :
                'bg-purple-500/30 text-purple-50 border border-purple-400/30'}`}>
              {selectedRole === 'student' ? 'Student Account' :
               selectedRole === 'shopkeeper' ? 'Vendor Account' :
               selectedRole === 'delivery' ? 'Delivery Account' :
               'Admin Account'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                           placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  name="userId"
                  placeholder={
                    selectedRole === 'student' || selectedRole === 'shopkeeper' 
                      ? 'Your ID (e.g., ABCDE12345)' 
                      : 'Your ID'
                  }
                  className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                           placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  value={formData.userId}
                  onChange={handleChange}
                  maxLength={selectedRole === 'student' || selectedRole === 'shopkeeper' ? 10 : undefined}
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                       placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {isSignUp && (
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="tel"
                name="mobileNumber"
                placeholder="Phone Number"
                className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                         placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                value={formData.mobileNumber}
                onChange={handleChange}
                maxLength={10}
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                       placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {isSignUp && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                className="bg-white/10 border border-white/20 rounded-lg p-3 pl-10 w-full text-white
                         placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}

          {isSignUp && selectedRole === 'shopkeeper' && (
            <>
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
                />
              </div>
            </>
          )}

          {isSignUp && selectedRole === 'delivery' && (
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
          )}

          {error && (
            <div className="text-red-300 text-center text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-white/20 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm
                     font-bold py-3 px-8 uppercase tracking-wider shadow-lg shadow-purple-600/20
                     hover:shadow-xl hover:shadow-purple-600/30 transition-all w-full disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>

          <div className="text-center text-white/70">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
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
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-300 hover:text-blue-200 font-medium hover:underline transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}