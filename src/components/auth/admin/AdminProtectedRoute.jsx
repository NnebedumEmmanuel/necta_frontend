import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const AdminProtectedRoute = ({ children }) => {
  const { session, loading: authLoading } = useAuth();
  const [validating, setValidating] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const validateAdmin = async () => {
      setValidating(true);

      try {
        // Call a backend admin-protected endpoint. backend returns 200 for admins, 403 for forbidden, 401 for unauthenticated.
        const res = await api.get('/admin/orders');
        if (!mounted) return;
        if (res?.status === 200) {
          setAllowed(true);
        } else {
          // Any other 2xx? treat as allowed
          setAllowed(true);
        }
      } catch (err) {
        if (!mounted) return;
        const status = err?.response?.status;
        if (status === 401) {
          navigate('/login', { replace: true });
        } else if (status === 403) {
          navigate('/', { replace: true });
        } else {
          // For other errors, redirect to login as a safe default
          navigate('/login', { replace: true });
        }
      } finally {
        if (mounted) setValidating(false);
      }
    };

    // Only attempt validation once initial auth loading is finished
    if (!authLoading) {
      validateAdmin();
    }

    return () => { mounted = false; };
  }, [authLoading, navigate]);

  // Show nothing while validating or while auth state is initializing
  if (authLoading || validating) return null;

  if (!allowed) return null; // navigation already performed on failure

  return children;
};

export default AdminProtectedRoute;