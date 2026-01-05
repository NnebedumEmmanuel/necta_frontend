

import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";


const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();

  // Wait for loading to finish before making any redirect decision
  if (loading) {
    return null;
  }

  // Redirect to /login only if session is null and not loading
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;