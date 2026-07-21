import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  UserCog,
  PlusCircle,
  Store,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/seller/products", label: "My Products", icon: Package },
  { to: "/seller/orders", label: "Orders", icon: ShoppingBag },
  { to: "/seller/profile", label: "Edit Profile", icon: UserCog },
];

export default function SellerLayout() {
  const { user } = useAuth();

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-8 lg:h-fit">
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-100 font-semibold text-forest-700">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">
              {user?.shopName || user?.name || "Your shop"}
            </p>
            <p className="text-xs capitalize text-ink-400">Seller account</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto rounded-xl border border-ink-100 bg-white p-2 lg:flex-col lg:overflow-visible">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-rust-500 text-cream-50"
                    : "text-ink-600 hover:bg-cream-100"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/seller/products/new"
          className="mt-3 hidden items-center justify-center gap-2 rounded-full bg-forest-600 px-4 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700 lg:flex"
        >
          <PlusCircle className="h-4 w-4" /> Add Product
        </NavLink>
      </aside>

      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
