import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContextCore.js';

// Proxy re-export to the top-level AuthContext implementation
export { AuthProvider } from '../../context/AuthContext.jsx';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export { default } from '../../context/AuthContext.jsx';
