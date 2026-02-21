// Protect routes for authenticated users
import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default ProtectedRoute;