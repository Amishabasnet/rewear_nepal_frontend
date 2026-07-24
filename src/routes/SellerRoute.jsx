import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SellerRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Loading..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
