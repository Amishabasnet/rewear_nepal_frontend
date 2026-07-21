import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/roleRedirect";

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to={getDashboardPath(user?.role)} replace />;

  return <Outlet />;
}
