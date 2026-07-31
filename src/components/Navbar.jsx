import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Menu, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import NavSidePanel from "./NavSidePanel";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <header className="border-b border-ink-100 bg-cream-50">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPanelOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-50"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-600 font-display text-lg font-bold text-cream-50">
              R
            </div>
            <span className="font-display text-lg font-semibold text-ink-900">
              ReWear <span className="text-rust-500">Nepal</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-600 sm:flex">
          <Link to="/products" className="hover:text-forest-600">
            Browse
          </Link>
          <Link
            to={isAuthenticated ? "/seller/dashboard" : "/register"}
            className="hover:text-forest-600"
          >
            Sell
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            aria-label="View cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-50"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-rust-500 px-1 text-[10px] font-bold leading-none text-cream-50">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
                <p className="text-xs capitalize text-ink-400">{user?.role}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 font-semibold text-forest-700">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="hidden items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50 sm:flex"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm font-medium text-ink-600 hover:text-rust-500 sm:inline">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !hidden !w-auto !px-4 !py-2 text-sm sm:!inline-flex">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <NavSidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </header>
  );
}
