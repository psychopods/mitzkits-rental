import { Router } from 'express';

import { body } from 'express-validator';
import { StudentController } from '../controllers/student.controller';

const router = Router();
const studentController = new StudentController();

router.get('/', studentController.getAllStudents);
router.get("/student_count", studentController.countAllStudents)
router.get("/get_flaged_students", studentController.countFlagedStudent)
router.get('/:studentId', studentController.getStudentById);
router.post('/',
  [
    body('studentId').notEmpty().trim(),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
  ],
  studentController.createStudent
);
router.put(
  '/:studentId',
  [
    // Validation rules
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Must be a valid email').normalizeEmail(),
  ],
  studentController.updateStudent
);

router.patch(
  '/:studentId/status',
  [
    body('status').isIn(['ACTIVE', 'INACTIVE', 'FROZEN', 'DEACTIVATED']),
  ],
  studentController.updateStudentStatus
);

router.post(
  '/:studentId/flags',
  [
    body('flag').isIn(['MISCONDUCT', 'OVERDUE', 'DAMAGED_ITEMS', 'PAYMENT_DUE']),
  ],
  studentController.addStudentFlag
);

router.delete('/:studentId/flags/:flag', studentController.removeStudentFlag);

export { router as studentRouter };