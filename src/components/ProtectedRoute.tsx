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
  const { ready, extrasReady, user, profile, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (!ready || (user && !extrasReady && !isSuperAdmin && profile?.status !== "approved")) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dwell-beige px-5 text-center text-dwell-muted">
        <p className="font-heading text-lg font-semibold text-dwell-charcoal">Verification still ongoing</p>
        <p className="mt-2 max-w-md text-sm">
          Super Admin has not enabled this account yet. Leave this page open and it will continue when you are approved.
        </p>
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

  if (!superAdmin && (profile?.status === "pending" || profile?.status === "rejected" || !profile)) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}
