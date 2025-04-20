// ShopkeeperRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ShopkeeperRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-2 text-gray-600">Verifying shopkeeper credentials...</p>
      </div>
    );
  }

  // If not logged in at all, redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  
  // If not a shopkeeper but trying to create a shop
  if (user.role !== 'shopkeeper' && location.pathname === '/shop/create') {
    // Special case - allow access to shop creation page
    return children;
  }
  
  // If logged in but not a shopkeeper, redirect to home
  if (user.role !== 'shopkeeper') {
    return <Navigate to="/home" replace />;
  }

  // User is a shopkeeper, allow access
  return children;
}