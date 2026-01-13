import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const AdminProtectedRoute = ({ children }) => {
  const [validating, setValidating] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const validate = async () => {
      setValidating(true);
      try {
        const res = await api.get('/admin/me');
        if (!mounted) return;
        if (res?.status === 200) {
          setAllowed(true);
          return;
        }
        // handle unexpected 2xx as allow
        if (res && res.status >= 200 && res.status < 300) {
          setAllowed(true);
          return;
        }
        // fallback
        navigate('/login', { replace: true });
      } catch (err) {
        if (!mounted) return;
        const status = err?.response?.status;
        if (status === 401) {
          navigate('/login', { replace: true });
        } else if (status === 403) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } finally {
        if (mounted) setValidating(false);
      }
    };

    validate();
    return () => { mounted = false; };
  }, [navigate]);

  if (validating) return null;
  if (!allowed) return null;

  return children;
};

export default AdminProtectedRoute;