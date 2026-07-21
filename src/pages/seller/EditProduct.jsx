import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PackageX } from "lucide-react";
import sellerService from "../../services/sellerService";
import ProductForm from "../../components/seller/ProductForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function SellerEditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setNotFound(false);

    sellerService
      .getProducts()
      .then(({ data }) => {
        if (!active) return;
        const list = data.products || data || [];
        const match = list.find((p) => (p._id || p.id)?.toString() === id);
        if (match) {
          setProduct(match);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading product..." />;

  if (notFound || !product) {
    return (
      <EmptyState
        icon={PackageX}
        title="Product not found"
        message="This listing may have been removed."
        action={
          <Link to="/seller/products" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
            Back to My Products
          </Link>
        }
        size="lg"
      />
    );
  }

  return <ProductForm mode="edit" productId={id} initialValues={product} />;
}
