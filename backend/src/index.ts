import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware, authorize } from './middleware/authMiddleware';
import { studentRouter } from './routes/student.routes';
import { kitRouter } from './routes/kit.routes';
import { borrowRouter } from './routes/borrow.routes';
import { adminRouter } from './routes/admin.routes';
import { adminAuthRouter } from './routes/adminAuth.route';
import './config/postgreSQL';
import './config/redisDB'; // connects automatically

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use('/api/students', authMiddleware, studentRouter);
app.use('/api/kits', authMiddleware, kitRouter);
app.use('/api/borrow', authMiddleware, borrowRouter);
app.use('/api/admin', authMiddleware, authorize, adminRouter);
app.use('/api/user', adminAuthRouter)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

async function startServer() {
  try {
    console.log('PostgreSQL connected');

    console.log('Redis client loaded (auto-connected)');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

startServer();
