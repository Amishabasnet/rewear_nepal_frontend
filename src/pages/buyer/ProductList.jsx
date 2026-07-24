import { useEffect, useState } from "react";
import { SearchX } from "lucide-react";
import productService from "../../services/productService";
import { sampleProducts } from "../../data/sampleProducts";
import ProductCard from "../../components/ProductCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import SearchBar from "../../components/SearchBar";
import { useQueryParams } from "../../hooks/useQueryParams";

function normalizeProduct(p = {}) {
  return {
    ...p,
    _id: p._id || p.id,
    title: p.title || p.name,
  };
}

function filterSampleProducts(products, keyword) {
  if (!keyword) return products;
  const term = keyword.trim().toLowerCase();
  if (!term) return products;
  return products.filter(
    (p) =>
      p.title?.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term)
  );
}

export default function ProductList() {
  const { params, setParams } = useQueryParams();
  const keyword = params.q || "";

  const [products, setProducts] = useState(sampleProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    productService
      .getAll(keyword ? { keyword } : undefined)
      .then(({ data }) => {
        if (!active) return;
        const fetched = data.products?.length
          ? data.products.map(normalizeProduct)
          : filterSampleProducts(sampleProducts, keyword);
        setProducts(fetched);
      })
      .catch(() => {
        if (!active) return;
        setProducts(filterSampleProducts(sampleProducts, keyword));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [keyword]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-semibold text-ink-900">Shop pre-loved fashion</h1>

      <div className="mb-6 max-w-md">
        <SearchBar value={keyword} onSearch={(q) => setParams({ q })} />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading items..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={keyword ? `No results for "${keyword}"` : "No products found"}
          message={
            keyword
              ? "Try a different keyword or browse all listings."
              : "Check back soon for new listings."
          }
          action={
            keyword ? (
              <button
                type="button"
                onClick={() => setParams({ q: undefined })}
                className="mt-1 text-sm font-semibold text-rust-500 hover:underline"
              >
                Clear search
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}