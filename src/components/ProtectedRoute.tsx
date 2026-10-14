import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({
  children,
  superAdmin = false,
}: {
  children: ReactNode;
  superAdmin?: boolean;
}) {
  const { ready, user, profile, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dwell-beige text-dwell-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={superAdmin ? "/super-admin/login" : "/login"}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (superAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!superAdmin && profile?.status === "pending") {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!superAdmin && profile?.status === "rejected") {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}
