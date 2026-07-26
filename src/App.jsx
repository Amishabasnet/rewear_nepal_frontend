import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import MainLayout from "./components/MainLayout";
import AuthLayout from "./components/AuthLayout";

import ProtectedRoute from "./routes/ProtectedRoute";
import SellerRoute from "./routes/SellerRoute";
import AdminRoute from "./routes/AdminRoute";

import Home from "./pages/static/Home";
import NotFound from "./pages/static/NotFound";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminPendingProducts from "./pages/admin/PendingProducts";
import AdminProductDetail from "./pages/admin/ProductDetail";
import AdminUsers from "./pages/admin/Users";
import AdminUserDetail from "./pages/admin/UserDetail";
import AdminReports from "./pages/admin/Reports";

import SellerLayout from "./components/seller/SellerLayout";
import AdminLayout from "./components/admin/AdminLayout";
import SellerDashboard from "./pages/seller/Dashboard";
import SellerProducts from "./pages/seller/Products";
import SellerAddProduct from "./pages/seller/AddProduct";
import SellerEditProduct from "./pages/seller/EditProduct";
import SellerOrders from "./pages/seller/Orders";

import ProductList from "./pages/buyer/ProductList";
import ProductDetail from "./pages/buyer/ProductDetail";
import Orders from "./pages/buyer/Orders";
import OrderDetail from "./pages/buyer/OrderDetail";
import Wishlist from "./pages/buyer/Wishlist";
import Cart from "./pages/buyer/Cart";
import Checkout from "./pages/buyer/Checkout";
import OrderSuccess from "./pages/buyer/OrderSuccess";
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import ChangePassword from "./pages/profile/ChangePassword";
import Addresses from "./pages/profile/Addresses";
import Messages from "./pages/messages/Message";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: "#26262B", color: "#FBF7F0", fontSize: "14px" },
          }}
        />
        <Routes>
          {/* Public site */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />

            {/* Any authenticated user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/profile/change-password" element={<ChangePassword />} />
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:conversationId" element={<Messages />} />
            </Route>

            {/* Role-specific dashboards */}
            <Route element={<SellerRoute />}>
              <Route element={<SellerLayout />}>
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/seller/products" element={<SellerProducts />} />
                <Route path="/seller/products/new" element={<SellerAddProduct />} />
                <Route path="/seller/products/:id/edit" element={<SellerEditProduct />} />
                <Route path="/seller/orders" element={<SellerOrders />} />
              </Route>
            </Route>
          </Route>

          {/* Admin panel — own dedicated layout (sidebar + topbar), no public navbar */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/pending" element={<AdminPendingProducts />} />
              <Route path="/admin/products/:id" element={<AdminProductDetail />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/:id" element={<AdminUserDetail />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>

          {/* Auth pages */}
          <Route element={<AuthLayout />}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}