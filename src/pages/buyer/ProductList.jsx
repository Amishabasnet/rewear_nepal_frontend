import { useEffect, useState } from "react";
import productService from "../../services/productService";
import { sampleProducts } from "../../data/sampleProducts";
import ProductCard from "../../components/ProductCard";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ProductList() {
  const [products, setProducts] = useState(sampleProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getAll()
      .then(({ data }) => setProducts(data.products?.length ? data.products : sampleProducts))
      .catch(() => setProducts(sampleProducts))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-ink-900">Shop pre-loved fashion</h1>
      {loading ? (
        <LoadingSpinner label="Loading items..." />
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
