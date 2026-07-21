import AdminSellersList from "../../components/admin/AdminSellersList";
import adminService from "../../services/adminService";

export default function AdminPendingSellers() {
  return (
    <AdminSellersList
      title="Pending Seller Requests"
      fetchFn={adminService.getPendingSellers}
      lockedStatus="pending"
      emptyTitle="No pending seller requests"
      emptyMessage="New seller applications will show up here for review."
    />
  );
}
