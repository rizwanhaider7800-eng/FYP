import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';

// Customer Pages
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';

// Seller Pages (Wholesaler/Supplier)
import SellerDashboard from './pages/seller/Dashboard';
import ManageProducts from './pages/seller/ManageProducts';
import SellerOrders from './pages/seller/Orders';
import BidRequests from './pages/seller/BidRequests';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCoupons from './pages/admin/ManageCoupons';

// Common Pages
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

function App() {
  const { user } = useAuthStore();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />

        {/* Protected Routes - All Authenticated Users */}
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        {/* Customer Routes */}
        <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

        {/* Seller Routes (Wholesaler/Supplier) */}
        <Route path="seller">
          <Route path="dashboard" element={<ProtectedRoute roles={['wholesaler', 'supplier']}><SellerDashboard /></ProtectedRoute>} />
          <Route path="products" element={<ProtectedRoute roles={['wholesaler', 'supplier']}><ManageProducts /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute roles={['wholesaler', 'supplier']}><SellerOrders /></ProtectedRoute>} />
          <Route path="bids" element={<ProtectedRoute roles={['wholesaler', 'supplier']}><BidRequests /></ProtectedRoute>} />
        </Route>

        {/* Admin Routes */}
        <Route path="admin">
          <Route path="dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="coupons" element={<ProtectedRoute roles={['admin']}><ManageCoupons /></ProtectedRoute>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;