import AdminProductsList from "../../components/admin/AdminProductsList";
import adminService from "../../services/adminService";

export default function AdminProducts() {
  return (
    <AdminProductsList
      title="All Products"
      fetchFn={adminService.getProducts}
      emptyTitle="No products found"
      emptyMessage="Try adjusting your search or status filter."
    />
  );
}
