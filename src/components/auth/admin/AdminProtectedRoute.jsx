// components/auth/AdminProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { authService } from '../../../../services/authServices';

const AdminProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (!authService.isAdmin()) {
    // Redirect to home if not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;