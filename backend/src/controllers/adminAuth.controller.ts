import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import pool from '../config/postgreSQL';

export class AdminAuthController {
  async register(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { username, email, password, role } = req.body;

      // check if user exists
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length) return res.status(400).json({ error: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);

      // find role id
      const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [role]);
      if (!roleResult.rows[0]) return res.status(400).json({ error: 'Invalid role' });

      const result = await pool.query(
        'INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
        [username, email, hashedPassword, roleResult.rows[0].id]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const userResult = await pool.query(
        'SELECT u.id, u.username, u.password, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1',
        [email]
      );

      if (!userResult.rows[0]) return res.status(400).json({ error: 'Invalid credentials' });

      const user = userResult.rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
}
