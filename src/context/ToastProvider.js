import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext.js';

// Proxy re-export so src-based imports can resolve to the project-level context folder
export { default, ToastProvider } from '../../context/ToastProvider.jsx';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
