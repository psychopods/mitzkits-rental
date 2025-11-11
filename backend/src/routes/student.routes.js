"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const student_controller_1 = require("../controllers/student.controller");
const router = (0, express_1.Router)();
exports.studentRouter = router;
const studentController = new student_controller_1.StudentController();
router.get('/', studentController.getAllStudents);
router.get("/student_count", studentController.countAllStudents);
router.get('/:studentId', studentController.getStudentById);
router.post('/', [
    (0, express_validator_1.body)('studentId').notEmpty().trim(),
    (0, express_validator_1.body)('firstName').notEmpty().trim(),
    (0, express_validator_1.body)('lastName').notEmpty().trim(),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
], studentController.createStudent);
router.put('/:studentId', [
    // Validation rules
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Must be a valid email').normalizeEmail(),
], studentController.updateStudent);
router.patch('/:studentId/status', [
    (0, express_validator_1.body)('status').isIn(['ACTIVE', 'INACTIVE', 'FROZEN', 'DEACTIVATED']),
], studentController.updateStudentStatus);
router.post('/:studentId/flags', [
    (0, express_validator_1.body)('flag').isIn(['MISCONDUCT', 'OVERDUE', 'DAMAGED_ITEMS', 'PAYMENT_DUE']),
], studentController.addStudentFlag);
router.delete('/:studentId/flags/:flag', studentController.removeStudentFlag);
