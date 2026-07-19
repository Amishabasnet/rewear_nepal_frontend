import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { sampleProducts } from "../../data/sampleProducts";
import { formatNPR } from "../../utils/formatCurrency";
import { addRecentlyViewed } from "../../utils/recentlyViewed";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = sampleProducts.find((p) => p._id === id) || sampleProducts[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProduct(found);
    addRecentlyViewed(found);
    setLoading(false);
  }, [id]);

  if (loading || !product) return <LoadingSpinner label="Loading item..." />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/products" className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-rust-500">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <img src={product.images?.[0]} alt={product.title} className="aspect-square w-full rounded-xl object-cover" />
        <div>
          <p className="text-sm font-semibold text-forest-600">{product.brand}</p>
          <h1 className="text-2xl font-semibold text-ink-900">{product.title}</h1>
          <p className="mt-3 text-xl font-bold text-rust-500">{formatNPR(product.price)}</p>
          <p className="mt-1 text-sm text-ink-400">
            Size {product.size} · {product.condition?.replaceAll("_", " ")}
          </p>
        </div>
      </div>
    </div>
  );
}
