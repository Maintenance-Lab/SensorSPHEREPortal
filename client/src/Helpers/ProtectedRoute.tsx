import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';
import { FC, ReactNode } from 'react';
import getUser from './getUser';

const cookies = new Cookies();

interface ProtectedRouteProps {
  children?: ReactNode;
}

export const ProtectedRoute: any = ({ children }: ProtectedRouteProps) => {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
};
