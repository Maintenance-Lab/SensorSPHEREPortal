import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { getUser } from './cookies';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export const ProtectedRoute: any = ({ children }: ProtectedRouteProps) => {
  const user = getUser();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(location.search);

  if (
    !user?.hasChangedPassword &&
    (normalizedPath !== '/account' || searchParams.get('action') !== 'change')
  ) {
    return <Navigate to="/account?action=change" replace />;
  }

  return children;
};

