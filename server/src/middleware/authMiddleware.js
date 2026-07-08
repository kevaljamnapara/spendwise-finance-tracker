import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * What this file does:
 * Contains middleware functions for route protection and role-based access control (RBAC).
 * 
 * Why this logic exists:
 * Middleware intercepts HTTP requests before they reach the controller. This allows us to 
 * verify a user's identity (authentication) or role (authorization) centrally rather than 
 * writing this check in every single controller function.
 */

/**
 * Input: HTTP request (checks cookies for 'jwt').
 * Output: Proceeds to the next middleware/controller if authorized; Error otherwise.
 * Flow:
 * 1. Read JWT from cookies.
 * 2. If present, verify the token using the secret key.
 * 3. Fetch the associated user from the DB and attach it to the `req.user` object.
 * 4. Call next() to proceed. If any step fails, return a 401 Unauthorized error.
 */
export const protect = async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      // Attach the user (without the password) to the request object
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

/**
 * Input: HTTP request (assumes `protect` middleware ran first, so req.user exists).
 * Output: Proceeds if user is admin; 403 Forbidden otherwise.
 * Flow: Checks if the user's role is 'admin'.
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Not authorized as an admin'));
  }
};
