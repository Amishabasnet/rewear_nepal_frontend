import { NavLink } from "react-router-dom";
import { Package, Heart, ShoppingBag, User, MapPin, MessageSquare, ShoppingCart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/orders", label: "My Orders", icon: Package, end: true },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/cart", label: "Cart", icon: ShoppingBag },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/addresses", label: "Addresses", icon: MapPin },
];

export default function BuyerSidebar() {
  const { user } = useAuth();

  return (
    <aside className="lg:sticky lg:top-8 lg:h-fit">
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rust-50 font-semibold text-rust-500">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{user?.name || "Your account"}</p>
          <p className="text-xs capitalize text-ink-400">Buyer account</p>
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
                isActive ? "bg-rust-500 text-cream-50" : "text-ink-600 hover:bg-cream-100"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
