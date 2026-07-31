import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  Camera,
  PackageSearch,
  Recycle,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";

import SearchBar from "../../components/SearchBar";
import ProductCard from "../../components/ProductCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import productService from "../../services/productService";

const CATEGORIES = ["Men", "Women", "Kids", "Accessories", "Footwear"];

const FALLBACK_IMAGE = "/images/placeholder.jpg";

const CATEGORY_SHOWCASE = [
  {
    name: "Women",
    image: "/images/women.jpg",
  },
  {
    name: "Men",
    image: "/images/men.jpg",
  },
  {
    name: "Kids",
    image: "/images/kids.jpg",
  },
  {
    name: "Footwear",
    image: "/images/footwear.jpg",
  },
  {
    name: "Accessories",
    image: "/images/accessories.jpg",
  },
];

const IMPACT_STATS = [
  {
    icon: Recycle,
    value: "12,000+",
    label: "garments kept out of landfill",
  },
  {
    icon: Users,
    value: "3,000+",
    label: "sellers across Nepal",
  },
  {
    icon: ShieldCheck,
    value: "4.7/5",
    label: "average buyer rating",
  },
];

const HOW_IT_WORKS = [
  {
    icon: Camera,
    step: "01",
    title: "Snap a few photos",
    body: "Photograph the item, add a price, and describe its condition. It takes less than five minutes.",
  },
  {
    icon: Upload,
    step: "02",
    title: "List it in minutes",
    body: "Your listing goes live to buyers browsing across Nepal, sorted by category and freshness.",
  },
  {
    icon: Banknote,
    step: "03",
    title: "Get paid and ship it",
    body: "Once a buyer checks out with Khalti or eSewa, pack the item and hand it off for delivery.",
  },
];

function normalizeProduct(product = {}) {
  return {
    ...product,
    title: product.title || product.name,
  };
}

function handleImageError(event) {
  const imageElement = event.currentTarget;

  if (!imageElement.src.includes("placeholder.jpg")) {
    imageElement.onerror = null;
    imageElement.src = FALLBACK_IMAGE;
  }
}

export default function Home() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("Women");
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRecentProducts = async () => {
      try {
        setLoading(true);

        const response = await productService.getAll({
          sort: "newest",
          limit: 4,
        });

        if (!isMounted) return;

        const products =
          response?.data?.products ||
          response?.products ||
          response?.data ||
          [];

        setRecentProducts(
          Array.isArray(products)
            ? products.map(normalizeProduct)
            : []
        );
      } catch (error) {
        console.error("Failed to load recent products:", error);

        if (isMounted) {
          setRecentProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecentProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const goToSearch = (query) => {
    const params = new URLSearchParams();

    if (query?.trim()) {
      params.set("q", query.trim());
    }

    const queryString = params.toString();

    navigate(`/products${queryString ? `?${queryString}` : ""}`);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    goToSearch(category);
  };

  return (
    <main className="min-h-screen">
      {/* Hero section */}
      <section className="overflow-hidden border-b border-ink-100 bg-cream-100/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:gap-8 lg:py-20">
          {/* Hero content */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-600">
              <Recycle className="h-3.5 w-3.5" />
              Nepal&apos;s pre-loved marketplace
            </span>

            <h1 className="mx-auto mt-4 max-w-xl font-display text-3xl font-semibold leading-tight text-ink-800 sm:text-4xl lg:mx-0 lg:text-[2.75rem]">
              Pre-loved fashion, newly found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm text-ink-600 sm:text-base lg:mx-0">
              Buy and sell second-hand clothes across Nepal—good for your
              wallet and better for the planet.
            </p>

            <div className="mx-auto mt-6 w-full max-w-md sm:mt-8 lg:mx-0">
              <SearchBar onSearch={goToSearch} />
            </div>

            {/* Category buttons */}
            <div className="mx-auto mt-5 max-w-4xl sm:mt-6 lg:mx-0">
              <div className="flex snap-x gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible lg:justify-start [&::-webkit-scrollbar]:hidden">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryClick(category)}
                    className={`chip shrink-0 snap-start ${
                      activeCategory === category ? "chip-active" : ""
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero local images */}
          <div className="relative mx-auto block h-72 w-full max-w-md sm:h-80 lg:h-96 lg:max-w-none">
            <img
              src="/images/hero-clothes.jpg"
              alt="Racks of pre-loved clothing"
              loading="eager"
              onError={handleImageError}
              className="absolute right-0 top-0 h-56 w-3/4 rounded-2xl object-cover shadow-lg sm:h-64 lg:h-72"
            />

            <img
              src="/images/hero-sweaters.jpg"
              alt="Folded pre-loved clothes"
              loading="eager"
              onError={handleImageError}
              className="absolute bottom-0 left-0 h-40 w-3/5 rounded-2xl border-4 border-cream-50 object-cover shadow-xl sm:h-48 lg:h-56"
            />

            <div className="absolute bottom-3 right-2 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-md sm:bottom-4 sm:right-4 lg:right-6">
              <Recycle className="h-4 w-4 text-forest-600" />

              <span className="text-xs font-semibold text-ink-800">
                12,000+ items rescued
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Impact statistics */}
      <section className="border-b border-forest-700 bg-forest-700 px-4 py-6 sm:py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 text-center text-cream-50 sm:grid-cols-3 sm:gap-4">
          {IMPACT_STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5"
            >
              <Icon className="h-5 w-5 text-mustard-400" />

              <p className="font-display text-xl font-semibold sm:text-2xl">
                {value}
              </p>

              <p className="text-[11px] text-forest-100 sm:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <h2 className="mb-5 text-lg font-semibold text-ink-900 sm:mb-6 sm:text-xl">
          Shop by category
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {CATEGORY_SHOWCASE.map(({ name, image }) => (
            <Link
              key={name}
              to={`/products?q=${encodeURIComponent(name)}`}
              className="group relative block aspect-square overflow-hidden rounded-xl bg-cream-100"
            >
              <img
                src={image}
                alt={`${name} clothing`}
                loading="lazy"
                onError={handleImageError}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />

              <span className="absolute bottom-2 left-2.5 text-sm font-semibold text-cream-50 sm:bottom-3 sm:left-3">
                {name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently listed */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="mb-5 flex items-center justify-between sm:mb-6">
          <h2 className="text-lg font-semibold text-ink-900 sm:text-xl">
            Recently listed
          </h2>

          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-semibold text-rust-500 hover:underline sm:text-sm"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading listings..." />
        ) : recentProducts.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No listings yet"
            message="Be the first to list something, or check back soon."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {recentProducts.map((product, index) => (
              <ProductCard
                key={product._id || product.id || index}
                product={product}
              />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-t border-ink-100 bg-cream-100/60 px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-center text-lg font-semibold text-ink-900 sm:mb-8 sm:text-xl">
            Selling on ReWear Nepal takes three steps
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
            {HOW_IT_WORKS.map(
              ({ icon: Icon, step, title, body }) => (
                <div
                  key={step}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-50 text-forest-600">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="font-display text-sm font-semibold text-ink-300">
                      {step}
                    </span>
                  </div>

                  <h3 className="mb-1 text-sm font-semibold text-ink-900">
                    {title}
                  </h3>

                  <p className="text-xs leading-relaxed text-ink-500">
                    {body}
                  </p>
                </div>
              )
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-rust-500 px-6 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-rust-600"
            >
              Start selling today
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}