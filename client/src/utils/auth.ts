// JwtPayload: A type definition representing the structure of a JSON Web Token payload.
// jwtDecode: A function used to decode a JSON Web Token (JWT) and extract its payload.
import { JwtPayload, jwtDecode } from 'jwt-decode';
import type { UserData } from '../interfaces/UserData';

class AuthService {

  // return the decoded JWT token or null if not determined
  getProfile(): UserData | null {
    const token = this.getToken();

    if (token) {
      try {
        const decodedToken = jwtDecode<UserData>(token);

        return decodedToken;
      } catch (error) {
        console.error("Error decoding the token:", error);
      }
    }
    return null;
  }

  /*
   * Check if the user is logged in 
   *
   * The user is only logged in if we can successfully retrieve the token from 
   * localStorage and the token's exp claim (expiration date) has not expired
   * 
   */
  loggedIn(): boolean {
    const token = this.getToken();  // read from localStorage

    if (token) {
      // the user has a token
      const decodedToken = this.getProfile();

      if (decodedToken) {
        // return true only if the token has not expired, false otherwise
        return !this.isTokenExpired(token);
      }
    }

    return false;
  }

  /*
   * Check the decoded token's exp claim
   * 
   * Return true if the token is expired, false otherwise
   * 
   */
  isTokenExpired(token: string): boolean {
    try {
      // Try to decode the token with jwtDecode
      const decoded = jwtDecode<JwtPayload>(token);

      /* Check if the decoded token has an 'exp' (expiration) property. 
         If it's less than the current time in seconds then it's still valid */
      // convert current time from ms to seconds
      if (decoded?.exp && decoded?.exp < Date.now() / 1000) {
        return true;  // expired
      }
    } catch (error) {
      /* If decoding fails, log the error and handle the error as an expired 
         access for security purposes */
      console.error("Failed to determine if the login access is current: ", error);

      return true;
    }

    // If the token is not expired, return false.
    return false;
  }

  /* 
    * Retrieve the encoded JWT token from localStorage or an empty string if it's 
    * not found.
    * 
    */
  getToken(): string {
    let loggedUser = '';

    try {
      loggedUser = localStorage.getItem('id_token') || '';
    } catch (error) {
      console.error("Error reading access token:", error);
    }

    return loggedUser;
  }

  // Store the JWT token in localStorage then redirect to the home page
  login(idToken: string) {
    // set the token to localStorage
    try {
      localStorage.setItem('id_token', idToken);
    } catch (error) {
      console.error("Error storing access token:", error);
    }

    // redirect to the home page
    window.location.assign('/');
  }

  // Remove the JWT token from localStorage then redirect to the login page
  logout() {
    // remove the token from localStorage
    try {
      localStorage.removeItem('id_token');
    } catch (error) {
      console.error('Error removing access token from local storage:', error);
    }

    /* Note that this method works in dev where Vite manages the environment, but 
       it doesn't work on the production CDN. Instead the logout action uses  
       React's useNavigate */
    // redirect to the login page
    //window.location.assign('/login');
  }
}

export default new AuthService();
