import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/roleRedirect";

export default function SellerRoute() {
  const { isAuthenticated, isSeller, user, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSeller) return <Navigate to={getDashboardPath(user?.role)} replace />;

  return <Outlet />;
}
