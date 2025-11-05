import { Router } from 'express';
import { body } from 'express-validator';
import { AdminAuthController } from '../controllers/adminAuth.controller';
import { authMiddleware, authorize } from '../middleware/authMiddleware';

const router = Router();
const controller = new AdminAuthController();

// Register (only super-admin can create admin)
router.post(
  '/register',
  [
    body('username').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['ADMIN', 'MODERATOR', 'USER']),
  ],
  controller.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  controller.login
);

export { router as adminAuthRouter };
