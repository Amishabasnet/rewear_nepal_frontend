import { Shirt } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import EmptyState from "./EmptyState";

export default function ProductGrid({
  products = [],
  loading = false,
  skeletonCount = 8,
  wishlistedIds = [],
  onWishlistChange,
  emptyTitle = "No items found",
  emptyMessage = "Try adjusting your filters or check back later.",
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <EmptyState icon={Shirt} title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          isWishlisted={wishlistedIds.includes(product._id)}
          onWishlistChange={onWishlistChange}
        />
      ))}
    </div>
  );
}
