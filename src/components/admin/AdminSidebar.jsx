import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Package, ShoppingBag, Flag, LogOut, ShieldCheck, X } from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
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
              isActive ? "bg-rust-500 text-cream-50" : "text-ink-300 hover:bg-ink-800 hover:text-cream-50"
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

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rust-500">
        <ShieldCheck className="h-5 w-5 text-cream-50" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-cream-50">ReWear Nepal</p>
        <p className="text-xs text-ink-400">Admin Panel</p>
      </div>
    </div>
  );
}

function LogoutButton({ onLogout }) {
  return (
    <div className="border-t border-ink-700 p-4">
      <button
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 transition hover:bg-ink-800 hover:text-cream-50"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );
}

// Renders the desktop fixed sidebar plus (when `mobileOpen`) a slide-over
// drawer version, both sharing the same nav items.
export default function AdminSidebar({ mobileOpen, onCloseMobile, onLogout }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink-900 lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav />
        </div>
        <LogoutButton onLogout={onLogout} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-ink-900">
            <div className="flex items-center justify-between px-5 py-6">
              <Brand />
              <button onClick={onCloseMobile} className="text-ink-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <SidebarNav onNavigate={onCloseMobile} />
            </div>
            <LogoutButton onLogout={onLogout} />
          </aside>
        </div>
      )}
    </>
  );
}
