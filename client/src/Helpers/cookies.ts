import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const getUser = () => {
  const cookies = new Cookies();
  const token = cookies.get('token');

  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    console.log(decoded);
    if (!decoded || !decoded.name) {
      cookies.remove('token');
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  const navigate = useNavigate();
  const cookies = new Cookies();
  cookies.remove('token');
  navigate('/');
};

export { getUser };
