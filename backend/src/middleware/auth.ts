import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth failed: No token provided', authHeader);
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    console.log('Token received:', token.substring(0, 20) + '...');
    console.log('JWT Secret:', config.jwtSecret.substring(0, 10) + '...');

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.log('Auth failed: Invalid token', error);
      console.log('Full token:', token);
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
  } catch (error) {
    console.log('Auth failed: Server error', error);
    res.status(500).json({ error: 'Server error' });
    return;
  }
};
