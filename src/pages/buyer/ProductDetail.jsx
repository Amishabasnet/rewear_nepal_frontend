import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Zap,
  Share2,
  Minus,
  Plus,
  Loader2,
  ShieldCheck,
  Truck,
  RotateCcw,
  PackageX,
  SearchX,
} from "lucide-react";

import productService from "../../services/productService";
import wishlistService from "../../services/wishlistService";
import reviewService from "../../services/reviewService";
import { sampleProducts } from "../../data/sampleProducts";
import { formatNPR } from "../../utils/formatCurrency";
import { addRecentlyViewed } from "../../utils/recentlyViewed";
import { CONDITION_LABEL } from "../../utils/constants";
import { getImageUrls } from "../../utils/getImageUrl";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ImageGallery from "../../components/ImageGallery";
import ReportProductButton from "../../components/ReportProductButton";
import ProductCard from "../../components/ProductCard";
import RatingStars from "../../components/RatingStars";
import ReviewList from "../../components/reviews/ReviewList";
import ReviewForm from "../../components/reviews/ReviewForm";

const FREE_DELIVERY_THRESHOLD = 5000;

function unwrap(res) {
  const data = res?.data;
  return data && typeof data === "object" && "data" in data ? data.data : data;
}

// Sample/demo product ids ("p1", "p2"...) aren't real Mongo documents — the backend
// will reject them with a validation error, so we detect and handle that up front.
function isValidObjectId(value) {
  return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);
}

function normalizeProduct(raw) {
  if (!raw) return null;
  const images = getImageUrls(raw.images);

  return {
    ...raw,
    _id: raw._id || raw.id,
    title: raw.title || raw.name,
    images,
  };
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [cartBusy, setCartBusy] = useState(null); // "cart" | "buy" | null

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Load the product — try the live API first, fall back to sample data
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setNotFound(false);
    setQuantity(1);

    productService
      .getById(id)
      .then((res) => {
        if (!active) return;
        const payload = normalizeProduct(unwrap(res));
        if (!payload?._id) throw new Error("Not found");
        setProduct(payload);
        addRecentlyViewed(payload);
      })
      .catch(() => {
        if (!active) return;
        const fallback = normalizeProduct(sampleProducts.find((p) => p._id === id));
        if (fallback) {
          setProduct(fallback);
          addRecentlyViewed(fallback);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  // Reviews for this product
  useEffect(() => {
    if (!product?._id) return;
    let active = true;
    reviewService
      .getProductReviews(product._id)
      .then((res) => {
        if (!active) return;
        const body = res?.data || {};
        const list = (body.data || []).map((r) => ({ ...r, buyer: r.buyer || r.user }));
        setReviews(list);
        setAvgRating(body.averageRating ?? product.rating ?? 0);
      })
      .catch(() => {
        if (active) setReviews([]);
      });
    return () => {
      active = false;
    };
  }, [product?._id]);

  // Check if this product is already saved on the buyer's wishlist
  useEffect(() => {
    if (!isAuthenticated || !product?._id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsWishlisted(false);
      return;
    }
    wishlistService
      .getWishlist()
      .then((res) => {
        const payload = unwrap(res) || {};
        const ids = (payload.products || []).map((p) => p._id || p);
        setIsWishlisted(ids.includes(product._id));
      })
      .catch(() => {});
  }, [isAuthenticated, product?._id]);

  const isDemoProduct = Boolean(product) && !isValidObjectId(product._id);

  const hasDiscount = product?.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product?.price ?? 0;
  const strikePrice = hasDiscount
    ? product.price
    : product?.originalPrice && product.originalPrice > (product?.price ?? 0)
      ? product.originalPrice
      : null;
  const discountPercent = strikePrice ? Math.round(100 - (displayPrice / strikePrice) * 100) : null;

  const stockKnown = typeof product?.stock === "number";
  const outOfStock = stockKnown && product.stock < 1;
  const lowStock = stockKnown && product.stock > 0 && product.stock <= 3;
  const maxQty = stockKnown ? Math.max(1, Math.min(product.stock, 10)) : 10;

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return sampleProducts
      .filter((p) => p._id !== product._id && (p.brand === product.brand || !product.brand))
      .slice(0, 4);
  }, [product]);

  const requireAuth = (message) => {
    if (isAuthenticated) return true;
    toast.error(message);
    navigate("/login");
    return false;
  };

  const adjustQuantity = (delta) => {
    setQuantity((q) => Math.min(maxQty, Math.max(1, q + delta)));
  };

  const handleAddToCart = async ({ redirectToCheckout = false } = {}) => {
    if (isDemoProduct) {
      toast.error(
        "This is sample/demo data — connect your backend and view a real listing to add it to your cart."
      );
      return;
    }
    if (!requireAuth("Log in to add items to your cart")) return;
    if (outOfStock) return;

    setCartBusy(redirectToCheckout ? "buy" : "cart");
    try {
      await addToCart(product._id, quantity);
      if (redirectToCheckout) {
        navigate("/checkout");
      } else {
        toast.success(`${product.title} added to your cart`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add this item to your cart");
    } finally {
      setCartBusy(null);
    }
  };

  const toggleWishlist = async () => {
    if (isDemoProduct) {
      toast.error(
        "This is sample/demo data — connect your backend and view a real listing to save it."
      );
      return;
    }
    if (!requireAuth("Log in to save items to your wishlist")) return;

    setWishlistBusy(true);
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(product._id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await wishlistService.addToWishlist(product._id);
        setIsWishlisted(true);
        toast.success("Saved to wishlist");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update your wishlist");
    } finally {
      setWishlistBusy(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url });
      } catch {
        /* user cancelled the native share sheet — nothing to do */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleReviewSubmitted = (review) => {
    setReviews((prev) => {
      const next = [{ ...review, buyer: review.buyer || review.user || user }, ...prev];
      setAvgRating(Math.round((next.reduce((s, r) => s + r.rating, 0) / next.length) * 10) / 10);
      return next;
    });
  };

  const canDeleteReview = (review) => {
    const reviewUserId = review.buyer?._id || review.buyer || review.user?._id || review.user;
    const myId = user?._id || user?.id;
    return Boolean(myId) && String(reviewUserId) === String(myId);
  };

  const handleDeleteReview = async (reviewId) => {
    setDeletingReviewId(reviewId);
    try {
      await reviewService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => (r._id || r.id) !== reviewId));
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete review");
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading item..." />;

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          icon={SearchX}
          title="We couldn't find this listing"
          message="It may have been sold, removed, or the link is incorrect."
          action={
            <Link to="/products" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
              Browse the shop
            </Link>
          }
        />
      </div>
    );
  }

  const conditionLabel = CONDITION_LABEL[product.condition] || product.condition?.replaceAll("_", " ");
  const myReview = reviews.find((r) => canDeleteReview(r));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:py-10 sm:pb-10">
      <Link
        to="/products"
        className="mb-6 flex w-fit items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-rust-500"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Images */}
        <div>
          <ImageGallery images={product.images} alt={product.title} />
        </div>

        {/* Details */}
        <div>
          {product.brand && <p className="text-sm font-semibold text-forest-600">{product.brand}</p>}
          <h1 className="mt-1 text-2xl font-semibold text-ink-900 sm:text-3xl">{product.title}</h1>

          {isDemoProduct && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mustard-100 px-3 py-1 text-xs font-semibold text-ink-700">
              Showing sample data — connect your backend to enable cart, wishlist &amp; reviews
            </p>
          )}

          {reviews.length > 0 && (
            <div className="mt-2">
              <RatingStars rating={avgRating} size="sm" reviewCount={reviews.length} />
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-rust-500">{formatNPR(displayPrice)}</span>
            {strikePrice && (
              <span className="text-base text-ink-400 line-through">{formatNPR(strikePrice)}</span>
            )}
            {discountPercent > 0 && (
              <span className="rounded-full bg-forest-100 px-2 py-0.5 text-xs font-bold text-forest-700">
                -{discountPercent}%
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {product.size && (
              <span className="rounded-full bg-cream-200 px-2.5 py-1 font-medium text-ink-600">
                Size {product.size}
              </span>
            )}
            {conditionLabel && (
              <span className="rounded-full bg-cream-200 px-2.5 py-1 font-medium capitalize text-ink-600">
                {conditionLabel}
              </span>
            )}
            {product.category && (
              <span className="rounded-full bg-cream-200 px-2.5 py-1 font-medium text-ink-600">
                {product.category}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="mt-3">
            {outOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500">
                <PackageX className="h-4 w-4" /> Out of stock
              </span>
            ) : lowStock ? (
              <span className="text-sm font-semibold text-mustard-600">
                Only {product.stock} left — grab it before it's gone
              </span>
            ) : (
              <span className="text-sm font-medium text-forest-600">In stock and ready to ship</span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-600">
            {product.description || "No description provided for this listing yet."}
          </p>

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm font-semibold text-ink-700">Quantity</span>
              <div className="flex items-center rounded-full border border-ink-200">
                <button
                  type="button"
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="p-2.5 text-ink-600 transition hover:text-rust-500 disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-ink-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(1)}
                  disabled={quantity >= maxQty}
                  aria-label="Increase quantity"
                  className="p-2.5 text-ink-600 transition hover:text-rust-500 disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Desktop / tablet actions */}
          <div className="mt-6 hidden gap-3 sm:flex">
            <button
              type="button"
              onClick={() => handleAddToCart()}
              disabled={cartBusy !== null || outOfStock}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              {cartBusy === "cart" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => handleAddToCart({ redirectToCheckout: true })}
              disabled={cartBusy !== null || outOfStock}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {cartBusy === "buy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Buy Now
            </button>
            <button
              type="button"
              onClick={toggleWishlist}
              disabled={wishlistBusy}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="shrink-0 rounded-full border border-ink-200 p-3 transition hover:border-rust-500 disabled:opacity-50"
            >
              {wishlistBusy ? (
                <Loader2 className="h-5 w-5 animate-spin text-ink-500" />
              ) : (
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-rust-500 text-rust-500" : "text-ink-600"}`} />
              )}
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share this listing"
              className="shrink-0 rounded-full border border-ink-200 p-3 text-ink-600 transition hover:border-rust-500 hover:text-rust-500"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Trust / delivery info */}
          <div className="mt-6 space-y-2 rounded-xl border border-dashed border-ink-200 bg-cream-50 p-4 text-xs text-ink-500">
            <p className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 shrink-0 text-forest-600" /> Free delivery on orders over{" "}
              {formatNPR(FREE_DELIVERY_THRESHOLD)}, cash on delivery available.
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-forest-600" /> Every listing is checked
              before it goes live on ReWear Nepal.
            </p>
            <p className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 shrink-0 text-forest-600" /> Something feel off? Report the
              listing below and our team will step in.
            </p>
          </div>

          <div className="mt-4">
            <ReportProductButton productId={product._id} />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-14 border-t border-ink-100 pt-10">
        <ReviewList
          reviews={reviews}
          avgRating={avgRating}
          canDelete={Boolean(myReview)}
          onDelete={handleDeleteReview}
          deletingId={deletingReviewId}
        />
        <div className="mt-6">
          {isDemoProduct ? (
            <p className="rounded-xl border border-dashed border-ink-200 bg-cream-50 p-4 text-sm text-ink-500">
              Reviews are disabled for this sample listing — they'll work once you're viewing a real
              product from your backend.
            </p>
          ) : (
            <ReviewForm productId={product._id} onSubmitted={handleReviewSubmitted} />
          )}
        </div>
      </div>

      {/* Similar items */}
      {similarProducts.length > 0 && (
        <div className="mt-14 border-t border-ink-100 pt-10">
          <h2 className="mb-4 text-xl font-semibold text-ink-900">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {similarProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-ink-100 bg-white/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
        <button
          type="button"
          onClick={toggleWishlist}
          disabled={wishlistBusy}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="shrink-0 rounded-full border border-ink-200 p-3 disabled:opacity-50"
        >
          {wishlistBusy ? (
            <Loader2 className="h-5 w-5 animate-spin text-ink-500" />
          ) : (
            <Heart className={`h-5 w-5 ${isWishlisted ? "fill-rust-500 text-rust-500" : "text-ink-600"}`} />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleAddToCart()}
          disabled={cartBusy !== null || outOfStock}
          className="btn-secondary flex-1 !py-2.5 disabled:opacity-50"
        >
          {cartBusy === "cart" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
          Cart
        </button>
        <button
          type="button"
          onClick={() => handleAddToCart({ redirectToCheckout: true })}
          disabled={cartBusy !== null || outOfStock}
          className="btn-primary flex-1 !py-2.5 disabled:opacity-50"
        >
          {cartBusy === "buy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Buy Now
        </button>
      </div>
    </div>
  );
}
