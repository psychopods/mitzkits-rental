import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { studentRouter } from './routes/student.routes';
import { kitRouter } from './routes/kit.routes';
import { borrowRouter } from './routes/borrow.routes';
import { adminRouter } from './routes/admin.routes';

dotenv.config();

const app = express();

// Redis client setup
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Database connection
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'library_kit_db',
  entities: [__dirname + '/entities/*.{js,ts}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', studentRouter);
app.use('/api/kits', kitRouter);
app.use('/api/borrow', borrowRouter);
app.use('/api/admin', adminRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();