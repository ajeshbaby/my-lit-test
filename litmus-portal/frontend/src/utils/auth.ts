import jwtDecode from 'jsonwebtoken';
import { history } from '../redux/configureStore';
import { getJWTToken, setCookie, setJWTToken } from './cookies';
import { getJwtTokenFromURL } from './getSearchParams';

interface UserDetails {
  role: string;
  uid: string;
  username: string;
  name?: string;
  email?: string;
  exp: Date;
  iat: Date;
}

// Logs out the user and unsets the jwt token
export function logout() {
  setCookie({ name: 'litmus-cc-token', value: '', exhours: 1 });
  window.location.reload();
}

// Sets the jwt token in the cookie
export function setUserDetails(token: string) {
  setJWTToken({
    token,
    cookieName: 'litmus-cc-token',
    errorMessage: 'ERROR IN SETTING USER DETAILS: ',
  });
}

// Returns the jwt token
export function getToken(): string {
  let jwtToken = getJWTToken('litmus-cc-token');

  if (jwtToken === '') {
    const _tokenFromUrl = getJwtTokenFromURL();
    if (_tokenFromUrl !== '') {
      jwtToken = _tokenFromUrl;
      setUserDetails(jwtToken);
      window.location.assign('/getStarted');
    } else {
      // Going to login page
      history.push('/login');
    }
  }

  return jwtToken;
}

// Returns the details of a user from jwt token
export function getUserDetailsFromJwt(): UserDetails {
  const jwtToken = getToken();
  const userDetails = jwtDecode.decode(jwtToken) as UserDetails;
  return userDetails;
}

// Returns the username from jwt token
export function getUsername(): string {
  if (getToken()) return getUserDetailsFromJwt().username;
  return '';
}

// Returns userId from jwt token
export function getUserId(): string {
  if (getToken()) return getUserDetailsFromJwt().uid;
  return '';
}

export function getUserRole(): string {
  if (getToken()) return getUserDetailsFromJwt().role;
  return '';
}

export function getUserEmail(): string {
  if (getToken()) return getUserDetailsFromJwt().email ?? '';
  return '';
}

export function getUserFullName(): string {
  if (getToken()) return getUserDetailsFromJwt().name ?? '';
  return '';
}
