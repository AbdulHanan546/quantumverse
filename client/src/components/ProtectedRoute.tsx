import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[]; // e.g., ['admin', 'student']
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, bootLoading, user } = useAuth();

  if (bootLoading) {
    return (
      <div className="min-h-dvh grid place-items-center">
        <Spinner label="Warming up..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user!.role)) {
  return <Navigate to={user!.role === 'admin' ? '/admin' : '/student'} replace />;
}


  return <>{children}</>;
}
