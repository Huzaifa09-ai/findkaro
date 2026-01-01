import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'merchant' | 'customer' | 'ADMIN';
}

const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div className="p-6 text-center">You must sign in to access this page.</div>;
  }
  if (requiredRole && user?.role !== requiredRole) {
    return <div className="p-6 text-center">Unauthorized for this section.</div>;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
