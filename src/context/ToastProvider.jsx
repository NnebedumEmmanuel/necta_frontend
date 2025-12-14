import React, { useState, useCallback } from 'react';
import { ToastContext } from './ToastContext';

let toastIdCounter = 0;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const { duration = 3500, type = 'info' } = options;
    const id = ++toastIdCounter;
    const newToast = { id, message, type };
    setToasts((t) => [newToast, ...t]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col items-end gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full px-4 py-2 rounded-lg shadow-lg text-white transform transition-all duration-250 ease-out ${
              toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
