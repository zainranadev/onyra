import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../common/Spinner";

// Customer-only paths that admins should not access
const CUSTOMER_ONLY_PATHS = ["/checkout", "/wishlist", "/account", "/order-success"];

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Verifying session..." />
      </div>
    );
  }

  // Not logged in — redirect to login
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // Admin trying to access a customer-only page → send to admin dashboard
  const isCustomerOnlyPath = CUSTOMER_ONLY_PATHS.some((p) => location.pathname.startsWith(p));
  if (isAdmin && isCustomerOnlyPath) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
