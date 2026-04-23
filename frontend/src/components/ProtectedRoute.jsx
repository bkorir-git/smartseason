import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingState from "./LoadingState.jsx";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <LoadingState message="Loading your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/agent"} replace />;
  }

  return children || <Outlet />;
}
