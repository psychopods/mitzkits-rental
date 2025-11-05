import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/postgreSQL';

interface JwtPayload {
  userId: number;
  role: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userResult = await pool.query('SELECT u.id, u.username, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [payload.userId]);

    if (!userResult.rows[0]) return res.status(401).json({ error: 'User not found' });

    // attach user info to request
    (req as any).user = userResult.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
