import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { getUser } from './cookies';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export const ProtectedRoute: any = ({ children }: ProtectedRouteProps) => {
  const user = getUser();
  console.log(user);

  if (!user) return <Navigate to="/login" />;

  if (!user?.hasChangedPassword && window.location.pathname !== "/account") return <Navigate to="/account?action=change" />;

  return children;
};

