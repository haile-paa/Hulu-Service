import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
}
