import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';

const getUser = () => {
  const cookies = new Cookies();
  console.log("Cookies", cookies);
  const token = cookies.get('token');
  console.log("Token", token);

  if (!token) return null;
  try {
    console.log("Decoding token");
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
