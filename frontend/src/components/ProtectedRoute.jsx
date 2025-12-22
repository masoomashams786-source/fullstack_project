import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../pages/auth-context";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useContext(AuthContext);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
