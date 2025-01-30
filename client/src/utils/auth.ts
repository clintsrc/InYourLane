import { JwtPayload, jwtDecode } from 'jwt-decode';

// Ensure the shape of decoded the auth token for type safety
interface DecodedToken extends JwtPayload {
  username: string;
  iat: number; // Issued At Time (Unix format, e.g. 1738261964)
  exp: number; // Expiration (Unix format, e.g. 1738265564)
}

class AuthService {

  // return the decoded token
  getProfile(): DecodedToken | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);

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
        return !this.isTokenExpired(decodedToken);
      }
    }

    return false;
  }

  // Return true if the token is expired, false otherwise
  isTokenExpired(decodedToken: DecodedToken): boolean {
    // Convert the payload's 'exp' timestamp value from seconds to milliseconds
    const expDate = decodedToken.exp * 1000;
    // Get current time in milliseconds
    const currentDate = new Date().getTime();

    // Check if the token is expired by comparing the expiration time with the current time
    if (expDate < currentDate) {
      console.log(`Login session expired.`);

      return true;
    }

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
