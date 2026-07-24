import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SearchBar from "../../components/SearchBar";
import ProductCard from "../../components/ProductCard";
import { sampleProducts } from "../../data/sampleProducts";

const CATEGORIES = ["Men", "Women", "Kids", "Accessories", "Footwear"];

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Women");

  const goToSearch = (q) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    navigate(`/products${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-ink-100 bg-cream-100/60 px-4 pb-10 pt-12 text-center sm:pb-14 sm:pt-20">
        <h1 className="mx-auto max-w-xl font-display text-2xl font-semibold leading-tight text-ink-800 sm:text-3xl md:max-w-2xl md:text-4xl">
          Pre-loved fashion, newly found
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-600 sm:mt-3 sm:text-base">
          Buy and sell second-hand clothes across Nepal
        </p>

        <div className="mx-auto mt-6 w-full max-w-md sm:mt-8 sm:max-w-lg md:max-w-xl">
          <SearchBar onSearch={goToSearch} />
        </div>

        {/* Category chips */}
        <div className="mx-auto mt-5 max-w-4xl sm:mt-6">
          <div className="flex snap-x gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`chip shrink-0 snap-start ${activeCategory === cat ? "chip-active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recently listed */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="mb-5 flex items-center justify-between sm:mb-6">
          <h2 className="text-lg font-semibold text-ink-900 sm:text-xl">Recently listed</h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-semibold text-rust-500 hover:underline sm:text-sm"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {sampleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
