import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import wishlistService from "../../services/wishlistService";
import WishlistItemCard from "../../components/WishlistItemCart";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { useCart } from "../../context/CartContext";

export default function Wishlist() {
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    wishlistService
      .getWishlist()
      .then(({ data }) => setItems(data.data?.products || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    setBusyId(productId);
    try {
      await wishlistService.removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => (item.product || item)._id !== productId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove item from wishlist");
    } finally {
      setBusyId(null);
    }
  };

  const handleMoveToCart = async (productId) => {
    setBusyId(productId);
    try {
      await addToCart(productId, 1);
      await wishlistService.removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => (item.product || item)._id !== productId));
      toast.success("Moved to cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not move item to cart");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-ink-900">Your Wishlist</h1>
      {loading ? (
        <LoadingSpinner label="Loading wishlist..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          message="Tap the heart icon on any item to save it here."
          action={
            <Link to="/products" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
              Explore items
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const product = item.product || item;
            return (
              <WishlistItemCard
                key={product._id}
                product={product}
                busy={busyId === product._id}
                onRemove={handleRemove}
                onMoveToCart={handleMoveToCart}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}