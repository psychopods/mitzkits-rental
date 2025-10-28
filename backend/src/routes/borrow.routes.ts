import { Router } from 'express';
import { body } from 'express-validator';
import { BorrowController } from '../controllers/borrow.controller';

const router = Router();
const borrowController = new BorrowController();

// Get all borrow transactions
router.get('/', borrowController.getAllTransactions);

// Get transaction by ID
router.get('/:id', borrowController.getTransactionById);

// Get transactions by student ID
router.get('/student/:studentId', borrowController.getStudentTransactions);

// Get transactions by kit ID
router.get('/kit/:kitId', borrowController.getKitTransactions);

// Create borrow transaction
router.post(
  '/',
  [
    body('studentId').notEmpty(),
    body('kitId').notEmpty(),
    body('initialCondition').isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  ],
  borrowController.createTransaction
);

// Return kit
router.post(
  '/:id/return',
  [
    body('returnCondition').isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
    body('notes').optional().trim(),
  ],
  borrowController.returnKit
);

// Update transaction status
router.patch(
  '/:id/status',
  [
    body('status').isIn(['ACTIVE', 'RETURNED', 'OVERDUE', 'LOST']),
  ],
  borrowController.updateTransactionStatus
);

export { router as borrowRouter };