import { Router } from 'express';
import { body } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

// Get system configuration
router.get('/config', adminController.getSystemConfig);

// Update system configuration
router.put(
  '/config',
  [
    body('loanPeriodDays').isInt({ min: 1 }),
    body('maxKitsPerStudent').isInt({ min: 1 }),
    body('retentionPeriodYears').isInt({ min: 1 }),
    body('penaltyRules').isArray(),
    body('penaltyRules.*.type').isIn(['DAMAGE', 'LATE_RETURN', 'LOSS']),
    body('penaltyRules.*.condition').isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
    body('penaltyRules.*.amount').isFloat({ min: 0 }),
  ],
  adminController.updateSystemConfig
);

// Get notification settings
router.get('/notifications', adminController.getNotificationConfig);

// Update notification settings
router.put(
  '/notifications',
  [
    body('type').isIn(['EMAIL', 'SMS']),
    body('enabled').isBoolean(),
    body('template').notEmpty(),
    body('triggers').isArray(),
    body('triggers.*').isIn([
      'DUE_DATE_REMINDER',
      'OVERDUE_NOTICE',
      'ACCOUNT_STATUS_CHANGE',
      'PENALTY_NOTICE'
    ]),
  ],
  adminController.updateNotificationConfig
);

// Run data retention/cleanup
router.post('/retention', adminController.runDataRetention);

// Get system statistics
router.get('/stats', adminController.getSystemStats);

export { router as adminRouter };