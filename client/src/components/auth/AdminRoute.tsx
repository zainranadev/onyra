import { Navigate, useLocation, Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../common/Spinner";
import { Button } from "../common/Button";

export function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <Spinner label="Checking administrative permissions..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
          <ShieldAlert size={32} />
        </div>
        <h1 className="font-display text-2xl text-ink font-semibold">Admin Access Required</h1>
        <p className="mt-2 max-w-md text-sm text-graphite">
          Your account does not have permission to view the Onyra Admin Panel. Please sign in with an administrator account.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/">
            <Button variant="secondary">Back to Store</Button>
          </Link>
          <Link to="/login?redirect=/admin">
            <Button variant="primary">Switch Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
