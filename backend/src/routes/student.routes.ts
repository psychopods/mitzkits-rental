import { Router } from 'express';
import { body } from 'express-validator';
import { StudentController } from '../controllers/student.controller';

const router = Router();
const studentController = new StudentController();

// Get all students
router.get('/', studentController.getAllStudents);

// Get student by ID
router.get('/:id', studentController.getStudentById);

// Create student
router.post(
  '/',
  [
    body('studentId').notEmpty().trim(),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
  ],
  studentController.createStudent
);

// Update student
router.put(
  '/:id',
  [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  studentController.updateStudent
);

// Update student status
router.patch(
  '/:id/status',
  [
    body('status').isIn(['ACTIVE', 'INACTIVE', 'FROZEN', 'DEACTIVATED']),
  ],
  studentController.updateStudentStatus
);

// Add flag to student
router.post(
  '/:id/flags',
  [
    body('flag').isIn(['MISCONDUCT', 'OVERDUE', 'DAMAGED_ITEMS', 'PAYMENT_DUE']),
  ],
  studentController.addStudentFlag
);

// Remove flag from student
router.delete('/:id/flags/:flag', studentController.removeStudentFlag);

export { router as studentRouter };