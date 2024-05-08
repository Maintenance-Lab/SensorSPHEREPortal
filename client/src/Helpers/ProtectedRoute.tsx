import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { getUser } from './cookies';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export const ProtectedRoute: any = ({ children }: ProtectedRouteProps) => {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
};

