"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
exports.adminRouter = router;
const adminController = new admin_controller_1.AdminController();
// Get system configuration
router.get('/config', adminController.getSystemConfig);
// Update system configuration
router.put('/config', [
    (0, express_validator_1.body)('loanPeriodDays').isInt({ min: 1 }),
    (0, express_validator_1.body)('maxKitsPerStudent').isInt({ min: 1 }),
    (0, express_validator_1.body)('retentionPeriodYears').isInt({ min: 1 }),
    (0, express_validator_1.body)('penaltyRules').isArray(),
    (0, express_validator_1.body)('penaltyRules.*.type').isIn(['DAMAGE', 'LATE_RETURN', 'LOSS']),
    (0, express_validator_1.body)('penaltyRules.*.condition').isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
    (0, express_validator_1.body)('penaltyRules.*.amount').isFloat({ min: 0 }),
], adminController.updateSystemConfig);
// Get notification settings
router.get('/notifications', adminController.getNotificationConfig);
// Update notification settings
router.put('/notifications', [
    (0, express_validator_1.body)('type').isIn(['EMAIL', 'SMS']),
    (0, express_validator_1.body)('enabled').isBoolean(),
    (0, express_validator_1.body)('template').notEmpty(),
    (0, express_validator_1.body)('triggers').isArray(),
    (0, express_validator_1.body)('triggers.*').isIn([
        'DUE_DATE_REMINDER',
        'OVERDUE_NOTICE',
        'ACCOUNT_STATUS_CHANGE',
        'PENALTY_NOTICE'
    ]),
], adminController.updateNotificationConfig);
// Run data retention/cleanup
router.post('/retention', adminController.runDataRetention);
// Get system statistics
router.get('/stats', adminController.getSystemStats);
