import { Request, Response, NextFunction } from 'express';

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' }); // Forbidden
  }
};
