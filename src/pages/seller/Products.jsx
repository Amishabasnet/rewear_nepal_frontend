import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Package, PlusCircle, Pencil, Trash2 } from "lucide-react";
import sellerService from "../../services/sellerService";
import ProductStatusBadge from "../../components/seller/ProductStatusBadge";
import { formatNPR } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const LOW_STOCK_THRESHOLD = 5;

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    sellerService
      .getProducts()
      .then(({ data }) => setProducts(data.products || data || []))
      .catch(() => {
        setProducts([]);
        toast.error("Could not load your products");
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (product) => {
    const id = product._id || product.id;
    const name = product.name || product.title || "this product";
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;

    setDeletingId(id);
    try {
      await sellerService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">My Products</h1>
        <Link
          to="/seller/products/new"
          className="flex items-center gap-2 rounded-full bg-rust-500 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-rust-600"
        >
          <PlusCircle className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading your products..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products listed yet"
          message="List your first item to start selling on ReWear Nepal."
          action={
            <Link to="/seller/products/new" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
              Add a product
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-cream-50 text-xs uppercase text-ink-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Approval</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {products.map((p) => {
                const id = p._id || p.id;
                const stock = p.stock ?? p.quantity ?? 0;
                return (
                  <tr key={id} className="hover:bg-cream-50">
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                        {p.image || p.images?.[0] ? (
                          <img
                            src={p.image || p.images[0]}
                            alt={p.name || p.title}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="font-medium text-ink-800">{p.name || p.title}</span>
                    </td>
                    <td className="px-4 py-3">{formatNPR(p.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          stock <= LOW_STOCK_THRESHOLD ? "font-semibold text-red-600" : "text-ink-700"
                        }
                      >
                        {stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ProductStatusBadge status={p.status || p.approvalStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/seller/products/${id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-600 transition hover:bg-cream-100"
                          aria-label="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
