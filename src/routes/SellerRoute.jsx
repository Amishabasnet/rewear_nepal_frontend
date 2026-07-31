import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getDashboardPath } from "../utils/roleRedirect";

export default function SellerRoute() {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Loading..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Admins don't belong in the seller panel — send them back to their own dashboard.
  if (isAdmin) return <Navigate to={getDashboardPath(user?.role)} replace />;

  return <Outlet />;
}
