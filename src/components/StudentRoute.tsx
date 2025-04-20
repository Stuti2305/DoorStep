// StudentRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function StudentRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2 text-gray-600">Authenticating student access...</p>
      </div>
    );
  }

  // Check if user exists
  if (!user) {
    // Use from property to remember where the user was trying to go
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  
  // Check role only if we have a user
  if (user.role !== 'student') {
    // Use a simple object to avoid re-renders
    return <Navigate to="/home" replace />;
  }

  return children;
}
