// components/auth/AdminProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { session, user, loading } = useAuth();

  // Wait for auth to hydrate before making decisions
  if (loading) return null;

  if (!session) return <Navigate to="/login" replace />;

  const isAdmin = (user && (user.role === 'admin' || user?.user_metadata?.role === 'admin')) || (localStorage.getItem('is_admin') === 'true');
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminProtectedRoute;