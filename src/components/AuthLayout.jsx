import { Link, Outlet, useLocation } from "react-router-dom";
import { Leaf, Recycle, Sparkles, Tag } from "lucide-react";

// Each auth screen gets its own photo, headline, and stat — small touch
// that makes the split-screen feel tailored rather than reused as-is.
const PANEL_CONTENT = {
  "/login": {
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80",
    eyebrow: "Welcome back",
    heading: "Your next favorite find is waiting.",
    body: "Log in to pick up where you left off — saved items, active orders, and new listings near you.",
    stat: { icon: Recycle, value: "12,000+", label: "items rescued from landfill" },
  },
  "/register": {
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
    eyebrow: "Join the movement",
    heading: "Turn your closet into cash.",
    body: "List what you no longer wear in minutes, and shop pre-loved fashion from sellers across Nepal.",
    stat: { icon: Tag, value: "3,000+", label: "sellers listing across Nepal" },
  },
};

export default function AuthLayout() {
  const { pathname } = useLocation();
  const panel = PANEL_CONTENT[pathname] || PANEL_CONTENT["/login"];
  const Icon = panel.stat.icon;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Mobile-only compact banner so the photo still shows up below lg */}
      <div className="relative h-40 overflow-hidden bg-forest-700 lg:hidden">
        <img src={panel.image} alt="" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-700 via-forest-700/40 to-transparent" />
        <Link to="/" className="absolute left-4 top-4 flex items-center gap-2 text-cream-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rust-500 font-display text-sm font-bold">
            R
          </div>
          <span className="font-display text-base font-semibold">ReWear Nepal</span>
        </Link>
        <p className="absolute bottom-3 left-4 right-4 font-display text-lg font-semibold leading-tight text-cream-50">
          {panel.heading}
        </p>
      </div>

      {/* Desktop image panel */}
      <div className="relative hidden overflow-hidden bg-forest-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <img
          src={panel.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-700/70 via-forest-700/40 to-forest-700/90" />

        <Link to="/" className="relative z-10 flex items-center gap-2 text-cream-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rust-500 font-display text-lg font-bold">
            R
          </div>
          <span className="font-display text-xl font-semibold">ReWear Nepal</span>
        </Link>

        <div className="relative z-10 space-y-4 text-cream-50">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mustard-400">
            <Sparkles className="h-3.5 w-3.5" /> {panel.eyebrow}
          </span>
          <h2 className="max-w-md font-display text-3xl font-semibold leading-tight">
            {panel.heading}
          </h2>
          <p className="max-w-sm flex items-start gap-2 text-sm text-forest-100">
            <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-mustard-400" /> {panel.body}
          </p>

          {/* Floating stat card — the one bold accent on this panel */}
          <div className="mt-6 flex w-fit items-center gap-3 rounded-2xl bg-cream-50/95 px-4 py-3 shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-50 text-forest-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-none text-ink-900">
                {panel.stat.value}
              </p>
              <p className="text-xs text-ink-500">{panel.stat.label}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream-50 px-6 py-10 lg:py-12">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
