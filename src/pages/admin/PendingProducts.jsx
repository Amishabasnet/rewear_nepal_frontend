import AdminProductsList from "../../components/admin/AdminProductsList";
import adminService from "../../services/adminService";

export default function AdminPendingProducts() {
  return (
    <AdminProductsList
      title="Pending Approvals"
      fetchFn={adminService.getPendingProducts}
      lockedStatus="pending"
      emptyTitle="No pending products"
      emptyMessage="New seller listings will show up here for review."
    />
  );
}
