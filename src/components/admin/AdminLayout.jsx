import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingBag,
  Flag,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/sellers", label: "Seller Approvals", icon: Store },
  { to: "/admin/products", label: "Product Approvals", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reports", label: "Reported Products", icon: Flag },
];

function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-rust-500 text-cream-50"
                : "text-ink-300 hover:bg-ink-800 hover:text-cream-50"
            }`
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink-900 lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rust-500">
            <ShieldCheck className="h-5 w-5 text-cream-50" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-cream-50">ReWear Nepal</p>
            <p className="text-xs text-ink-400">Admin Panel</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav />
        </div>
        <div className="border-t border-ink-700 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 transition hover:bg-ink-800 hover:text-cream-50"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-ink-900">
            <div className="flex items-center justify-between px-5 py-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rust-500">
                  <ShieldCheck className="h-5 w-5 text-cream-50" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-cream-50">ReWear Nepal</p>
                  <p className="text-xs text-ink-400">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-ink-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-ink-700 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 transition hover:bg-ink-800 hover:text-cream-50"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-100 bg-cream-50/90 px-4 py-3.5 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-ink-600 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-ink-900 sm:text-base">
                Admin Dashboard
              </h1>
              <p className="hidden text-xs text-ink-400 sm:block">
                Overview of platform activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative rounded-full p-2 text-ink-500 transition hover:bg-cream-100">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5 border-l border-ink-100 pl-3 sm:pl-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-100 text-sm font-semibold text-forest-700">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="truncate text-xs font-semibold text-ink-900">
                  {user?.name || "Admin"}
                </p>
                <p className="text-[11px] capitalize text-ink-400">{user?.role || "admin"}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
