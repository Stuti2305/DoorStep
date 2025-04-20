import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { UserRole } from './types/types';
import LaunchScreen from './pages/LaunchScreen';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import MyProfile from './pages/MyProfile';
import DeliveryAddress from './pages/DeliveryAddress';
import ContactUs from './pages/ContactUs';
import HelpAndFAQs from './pages/HelpAndFAQs';
import Settings from './pages/Settings';
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
import Orders from './pages/Orders/index';
import Tracking from './pages/Tracking';
import MyOrders from './pages/MyOrders';
import AddProduct from './pages/shop/AddProduct';
import AddCategory from './pages/shop/AddCategory';
import Categories from './pages/shop/Categories';
import EditProduct from './pages/shop/EditProduct';
import EditCategory from './pages/shop/EditCategory';
import ShopProfile from './pages/shop/Profile';
import CreateShop from './pages/shop/createShop';
import ShopPage from './pages/shopPage';
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
                    <StudentRoute>
                      <Home />
                    </StudentRoute>
                  } />

                  {/* Public Routes */}
                  <Route path="/category/:category" element={<CategoryPage />} />
                  
                  {/* Student Routes */}
                  <Route path="/product/:id" element={
                    <StudentRoute>
                      <ProductPage />
                    </StudentRoute>
                  } />
                  <Route path="/shops/:shopId" element={<ShopPage />} />
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
                    <StudentRoute>
                      <FoodPage />
                    </StudentRoute>
                  } />
                  <Route path="/my-orders" element={
                    <StudentRoute>
                      <MyOrders />
                      </StudentRoute>
                  } />

                  {/* Profile Routes */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/my-profile" element={<MyProfile />} />
                  <Route path="/delivery-address" element={<DeliveryAddress />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/help-faqs" element={<HelpAndFAQs />} />
                  <Route path="/settings" element={<Settings />} />

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
                        <Route path="create" element={
                          
                            <CreateShop />
                          
                        } />
                        <Route path="products" element={
                          
                            <Products />
                          
                        } />
                        <Route path="add-product" element={
                          <ShopkeeperRoute>
                            <AddProduct />
                          </ShopkeeperRoute>
                        } />
                        <Route path="edit-product/:id" element={
                          <ShopkeeperRoute>
                            <EditProduct />
                          </ShopkeeperRoute>
                        } />
                        <Route path="categories" element={
                          <ShopkeeperRoute>
                            <Categories />
                          </ShopkeeperRoute>
                        } />
                        <Route path="add-category" element={
                          <ShopkeeperRoute>
                            <AddCategory />
                          </ShopkeeperRoute>
                        } />
                        <Route path="edit-category/:id" element={
                          <ShopkeeperRoute>
                            <EditCategory />
                          </ShopkeeperRoute>
                        } />
                        <Route path="profile" element={
                          <ShopkeeperRoute>
                            <ShopProfile />
                          </ShopkeeperRoute>
                        } />
                      </Routes>
                    </ProtectedRoute>
                  } />
                  <Route path="/stationery" element={
                    <StudentRoute>
                      <StationeryPage />
                    </StudentRoute>
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