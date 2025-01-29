import { Router, Request, Response } from 'express';
import { User } from '../models/user.js'; // db User model
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';  // for password hashing

/*
 * login
 *
 * Authenticate a user.
 * 
 * The user must exist in the database, including a stored hashed password.
 * If the database password matches the password in the request header (added by the 
 * middlware), then return a JWT token.
 * 
 */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;  // Extract username and password from request body

  // Find the user in the database by username to retrieve their encrypted stored password
  const user = await User.findOne({
    where: { username },
  });

  // User is not found, send response 'auth failed' status 401
  if (!user) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // Use bcrypt to compare the password stored in the incoming request object to the hashed password stored in the databse
  const passwordIsValid = await bcrypt.compare(password, user.password);

  // Password is invalid, send response 'auth failed' status 401
  if (!passwordIsValid) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // Read the JWT secret key from environment variables
  const secretKey = process.env.JWT_SECRET_KEY || '';

  // Generate a temporary JWT token for the authenticated, valid for 1 hour
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

  // Send the token back to the client in as a JSON response
  return res.json({ token });
};

const router = Router();

// POST /login - Login a user
router.post('/login', login); // Define the login route

export default router;
