"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.borrowRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const borrow_controller_1 = require("../controllers/borrow.controller");
const router = (0, express_1.Router)();
exports.borrowRouter = router;
const borrowController = new borrow_controller_1.BorrowController();
// Get all borrow transactions
router.get('/', borrowController.getAllTransactions);
router.get('/borrow_counts', borrowController.getTransactionCounts);
// Get transactions by student ID
router.get('/student/:studentId', borrowController.getStudentTransactions);
// Get transactions by kit ID - MUST BE BEFORE /:id
router.get('/kit/:kitId', borrowController.getKitTransactions);
router.get('/:id', borrowController.getTransactionById);
// Create borrow transaction
router.post('/', [
    (0, express_validator_1.body)('studentId').notEmpty(),
    (0, express_validator_1.body)('kitId').notEmpty(),
    (0, express_validator_1.body)('initialCondition').isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
], borrowController.createTransaction);
// Return kit
router.post('/:id/return', [
    (0, express_validator_1.body)('returnCondition').isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
    (0, express_validator_1.body)('notes').optional().trim(),
], borrowController.returnKit);
// Update transaction status
router.patch('/:id/status', [
    (0, express_validator_1.body)('status').isIn(['ACTIVE', 'RETURNED', 'OVERDUE', 'LOST']),
], borrowController.updateTransactionStatus);
