import AdminSellersList from "../../components/admin/AdminSellersList";
import adminService from "../../services/adminService";

export default function AdminSellers() {
  return (
    <AdminSellersList
      title="All Sellers"
      fetchFn={adminService.getSellers}
      emptyTitle="No sellers found"
      emptyMessage="Try adjusting your search or status filter."
    />
  );
}
