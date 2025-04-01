import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserById, User } from '../models/User'; // Adjust path as needed

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User | null; // Make user optional or null initially
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables.");
    return res.status(500).json({ message: 'Server configuration error' });
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      // Get user from the token using the ID
      // Ensure findUserById excludes the password
      req.user = await findUserById(decoded.id);

      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
