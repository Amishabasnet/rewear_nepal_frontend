import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  X,
  Home,
  ShoppingBag,
  LayoutDashboard,
  Package,
  Heart,
  ShoppingCart,
  MessageSquare,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NavSidePanel({ isOpen, onClose }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive ? "bg-rust-500 text-cream-50" : "text-ink-600 hover:bg-cream-100"
    }`;

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex h-full">
      <div className="relative flex h-full w-80 max-w-[85vw] flex-col bg-cream-50 shadow-xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 font-display text-sm font-bold text-cream-50">
              R
            </div>
            <span className="font-display text-base font-semibold text-ink-900">
              ReWear <span className="text-rust-500">Nepal</span>
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-100 font-semibold text-forest-700">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
              <p className="text-xs capitalize text-ink-400">{user?.role}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <NavLink to="/" end className={linkClass} onClick={onClose}>
            <Home className="h-4 w-4 shrink-0" /> Home
          </NavLink>
          <NavLink to="/products" className={linkClass} onClick={onClose}>
            <ShoppingBag className="h-4 w-4 shrink-0" /> Browse
          </NavLink>

          {isAuthenticated ? (
            <>
              {(user?.role === "seller" || user?.role === "admin") && (
                <NavLink
                  to={user?.role === "seller" ? "/seller/dashboard" : "/admin/dashboard"}
                  className={linkClass}
                  onClick={onClose}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" /> Dashboard
                </NavLink>
              )}

              {user?.role === "seller" && (
                <NavLink to="/seller/products" className={linkClass} onClick={onClose}>
                  <Package className="h-4 w-4 shrink-0" /> My Products
                </NavLink>
              )}

              {user?.role === "buyer" && (
                <>
                  <NavLink to="/orders" className={linkClass} onClick={onClose}>
                    <Package className="h-4 w-4 shrink-0" /> My Orders
                  </NavLink>
                  <NavLink to="/wishlist" className={linkClass} onClick={onClose}>
                    <Heart className="h-4 w-4 shrink-0" /> Wishlist
                  </NavLink>
                  <NavLink to="/cart" className={linkClass} onClick={onClose}>
                    <ShoppingCart className="h-4 w-4 shrink-0" /> Cart
                  </NavLink>
                </>
              )}

              <NavLink to="/messages" className={linkClass} onClick={onClose}>
                <MessageSquare className="h-4 w-4 shrink-0" /> Messages
              </NavLink>
              <NavLink to="/profile" className={linkClass} onClick={onClose}>
                <User className="h-4 w-4 shrink-0" /> Profile
              </NavLink>
            </>
          ) : (
            <NavLink to="/register" className={linkClass} onClick={onClose}>
              <ShoppingBag className="h-4 w-4 shrink-0" /> Sell on ReWear
            </NavLink>
          )}
        </nav>

        <div className="border-t border-ink-100 p-4">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleNavigate("/login")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
              >
                <LogIn className="h-4 w-4" /> Log in
              </button>
              <button
                onClick={() => handleNavigate("/register")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rust-500 px-4 py-2.5 text-sm font-semibold text-cream-50 hover:bg-rust-600"
              >
                <UserPlus className="h-4 w-4" /> Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
