// Importing specific types and functions from the 'jwt-decode' library.
// JwtPayload: A type definition representing the structure of a JSON Web Token payload.
// jwtDecode: A function used to decode a JSON Web Token (JWT) and extract its payload.
import { JwtPayload, jwtDecode } from 'jwt-decode';
import type { UserData } from '../interfaces/UserData';

class AuthService {

  // return the decoded token
  getProfile(): UserData | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode<UserData>(token);

        return decodedToken;
      } catch (error) {
        console.error('Error decoding the token:', error);
      }
    }
    return null;
  }

  // Check if the user is logged in 
  // The user is only logged in if we can successfully retrieve the token from 
  // localStorage and the token's exp claim (expiration date) has not expired
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

  // Return true if the token is expired, false otherwise
  isTokenExpired(token: string): boolean {
    try {
      // Attempt to decode the provided token using jwtDecode, expecting a JwtPayload type.
      const decoded = jwtDecode<JwtPayload>(token);

      // Check if the decoded token has an 'exp' (expiration) property and if it is less than the current time in seconds.
      if (decoded?.exp && decoded?.exp < Date.now() / 1000) {
        // If the token is expired, return true indicating that it is expired.
        return true;
      }
    } catch (err) {
      // If decoding fails (e.g., due to an invalid token format), catch the error and return false.
      return false;
    }
    // If the token is not expired, return false.
    return false;
  }

  // Retrieve the encoded JWT token from localStorage
  getToken(): string {
    const loggedUser = localStorage.getItem('id_token') || '';

    return loggedUser;
  }

  // Store the JWT token in localStorage then redirect to the home page
  login(idToken: string) {
    // set the token to localStorage
    localStorage.setItem('id_token', idToken);

    // redirect to the home page
    window.location.assign('/');
  }

  // Remove the JWT token from localStorage then redirect to the home page
  logout() {
    // remove the token from localStorage
    localStorage.removeItem('id_token');

    // redirect to the login page
    window.location.assign('/');
  }
}

export default new AuthService();
