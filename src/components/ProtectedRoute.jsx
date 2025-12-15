// components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authServices';

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/account" replace />;
  }

  return children;
};

export default ProtectedRoute;