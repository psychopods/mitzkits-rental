import { Router } from 'express';
import { body } from 'express-validator';
import { StudentController } from '../controllers/student.controller';

const router = Router();
const studentController = new StudentController();

router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
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
router.put(
  '/:id',
  [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  studentController.updateStudent
);
router.patch(
  '/:id/status',
  [
    body('status').isIn(['ACTIVE', 'INACTIVE', 'FROZEN', 'DEACTIVATED']),
  ],
  studentController.updateStudentStatus
);

router.post(
  '/:id/flags',
  [
    body('flag').isIn(['MISCONDUCT', 'OVERDUE', 'DAMAGED_ITEMS', 'PAYMENT_DUE']),
  ],
  studentController.addStudentFlag
);

router.delete('/:id/flags/:flag', studentController.removeStudentFlag);

export { router as studentRouter };