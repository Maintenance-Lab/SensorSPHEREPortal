import { Navigate, useLocation } from "react-router-dom";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import { ReactElement } from "react";

const cookies = new Cookies();

export const ProtectedRoute = ({ children }: { children: ReactElement }): ReactElement => {
  console.log("Cookies:", cookies);
  const token = cookies.get("token");
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded || !decoded.user) {
      cookies.remove("token");
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  } catch (error) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
