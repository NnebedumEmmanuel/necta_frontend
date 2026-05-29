import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// ProtectedRoute: ensures a user is authenticated, and optionally is an admin
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // (debug logs removed) Decision is performed below

  // While auth is resolving, render an explicit loading state so we don't proceed too early
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If no user, redirect admins to admin login and everyone else to customer login
  if (!user) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} state={{ from: location }} replace />;
  }

  // If this route requires admin and the user is not admin, redirect to the admin login screen
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
