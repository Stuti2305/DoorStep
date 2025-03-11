import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { UserRole } from './types';
import LaunchScreen from './pages/LaunchScreen';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import ForgotPassword from './pages/ForgotPassword';
import StationeryPage from './pages/StationeryPage';
import AdminCategories from './pages/admin/Categories';
import { CategoryProvider } from './contexts/CategoryContext';
import AdminDashboard from './pages/admin/Dashboard';
import ShopDashboard from './pages/shop/Dashboard';
import { CartProvider } from './contexts/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout'; 
import { Toaster } from 'react-hot-toast';
import FoodPage from './pages/FoodPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import StudentRoute from './components/StudentRoute';
import ShopkeeperRoute from './components/ShopkeeperRoute';
import AdminRoute from './components/AdminRoute';
import Products from './pages/shop/Products';
import Layout from './components/Layout';
//import Orders from './pages/Orders';
import Orders from './pages/Orders/index';
import Tracking from './pages/tracking'; // Adjust the path as needed
// Protected Route Component
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: UserRole[] 
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <CartProvider>
          <Router>
            <ErrorBoundary>
              <Navbar />
              <Layout>
                <Routes>
                  <Route path="/" element={<LaunchScreen />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Protected Routes */}
                  <Route path="/home" element={
                    <ProtectedRoute allowedRoles={['student', 'shopkeeper', 'admin']}>
                      <Home />
                    </ProtectedRoute>
                  } />

                  {/* Student Routes */}
                  <Route path="/category/:category" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CategoryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/product/:id" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ProductPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/cart" element={
                    <StudentRoute>
                      <Cart />
                    </StudentRoute>
                  } />
                  <Route path="/checkout" element={
                    <StudentRoute>
                      <Checkout />
                    </StudentRoute>
                  } />
                  <Route path="/food" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <FoodPage />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Routes>
                        <Route path="dashboard" element={
                          <AdminRoute>
                            <AdminDashboard />
                          </AdminRoute>
                        } />
                        <Route path="categories" element={<AdminCategories />} />
                        {/* Add more admin routes */}
                      </Routes>
                    </ProtectedRoute>
                  } />

                  {/* Shopkeeper Routes */}
                  <Route path="/shop/*" element={
                    <ProtectedRoute allowedRoles={['shopkeeper']}>
                      <Routes>
                        <Route path="dashboard" element={
                          <ShopkeeperRoute>
                            <ShopDashboard />
                          </ShopkeeperRoute>
                        } />
                        <Route path="products" element={
                          <ShopkeeperRoute>
                            <Products />
                          </ShopkeeperRoute>
                        } />
                        {/* Add more shop routes */}
                      </Routes>
                    </ProtectedRoute>
                  } />

                  <Route path="/profile" element={<Profile />} />
                  <Route path="/stationery" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StationeryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders" element={<StudentRoute><Orders /></StudentRoute>} />
                  <Route path="/tracking" element={<Tracking />} />
                </Routes>
              </Layout>
              <Toaster />
            </ErrorBoundary>
          </Router>
        </CartProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}

export default App;