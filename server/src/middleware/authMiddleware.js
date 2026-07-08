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

// JWT Stateless Authentication
// Instead of storing a session on the server, the server signs a token containing the user ID 
// and sends it to the client as an HttpOnly cookie. On subsequent requests, the server verifies 
// the signature using the JWT_SECRET to authenticate the user without querying a session store.

export const protect = async (req, res, next) => {
  let token;

  // The cookie parser middleware automatically extracts the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      // jwt.verify checks the signature and expiration date
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Attach the user (without the password) to the request object so subsequent controllers can use it
      req.user = await User.findById(decoded.userId).select('-password');
      next(); // Authentication successful, proceed to the next middleware or controller
    } catch (error) {
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
