import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';

const getUser = () => {
  const cookies = new Cookies();
  const token = cookies.get('token');

  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
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
  const cookies = new Cookies();
  cookies.remove('token');
  window.location.href = '/'
};

export { getUser };
