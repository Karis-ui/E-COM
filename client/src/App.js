import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { fetchCart } from './store/slices/cartSlice';
import { getProfile } from './store/slices/authSlice';
import Navbar from './components/common/Navbar';
import Footer from './components/common/footer';
import FloatingToolbar from './components/common/FloatingToolbar';
import LoadingSpinner from './components/common/LoadingSpinner';
import AdminLayout from './components/admin/AdminLayout';
import { timeoutManager } from '@tanstack/react-query';

const HomePage = React.lazy(() => import('./pages/HomePage'));
const ShopPage = React.lazy(() => import('./pages/ShopPage'));
const ProductDetailsPage = React.lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = React.lazy(() => import('./pages/OrderSuccessPage'));
const OrderTrackingPage = React.lazy(() => import('./pages/OrderTrackingPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const OrdersPage = React.lazy(() => import('./pages/MyOrders'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPass'));
const Register = React.lazy(() => import('./components/common/Register'));
const Login = React.lazy(() => import('./components/common/Login'));

const AdminDashboardPage = React.lazy(() => import('./components/admin/AdminDashboardPage'));
const AdminProductPage = React.lazy(() => import('./components/admin/AdminProduct'));
const AdminCategoriesPage = React.lazy(() => import('./components/admin/AdminCategoriesPage'));
const AdminBrandsPage = React.lazy(() => import('./components/admin/AdminBrandsPage'));
const AdminOrdersPage = React.lazy(() => import('./components/admin/AdminOrdersPage'));
const AdminRidersPage = React.lazy(() => import('./components/admin/AdminRidersPage'));
const AdminCustomersPage = React.lazy(() => import('./components/admin/AdminCustomersPage'));
const AdminCouponsPage = React.lazy(() => import('./components/admin/AdminCouponsPage'));
const AdminSettingsPage = React.lazy(() => import('./components/admin/AdminSettingsPage'));
const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin'));


const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children;
}

const queryClient = new QueryClient();
function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      dispatch(getProfile());
      dispatch(fetchCart());
    }
  }, [dispatch])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#050505]">
          <Navbar />
          <FloatingToolbar />
          <main className="flex-grow pt-0">
            <React.Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/track-order/:orderId" element={<OrderTrackingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/admin-login" element={<AdminLogin />} />

                <Route path='/orders' element={
                  <ProtectedRoute><OrdersPage /></ProtectedRoute>
                } />
                <Route path='/profile' element={
                  <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductPage />} />
                  <Route path="products/add" element={<AdminProductPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="brands" element={<AdminBrandsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="orders/:status" element={<AdminOrdersPage />} />
                  <Route path="riders" element={<AdminRidersPage />} />
                  <Route path="riders/add" element={<AdminRidersPage />} />
                  <Route path="delivery/assign" element={<AdminRidersPage />} />
                  <Route path="delivery/track" element={<AdminRidersPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="customers/add" element={<AdminRidersPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="coupons/add" element={<AdminRidersPage />} />
                  <Route path="reports" element={<AdminRidersPage />} />
                  <Route path="reports/:type" element={<AdminRidersPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="settings/:tab" element={<AdminRidersPage />} />

                  <Route path='*' element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </React.Suspense>
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}
export default App;
