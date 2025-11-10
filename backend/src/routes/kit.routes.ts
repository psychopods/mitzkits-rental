import { Router } from 'express';
import { body } from 'express-validator';
import { KitController } from '../controllers/kit.controller';

const router = Router();
const kitController = new KitController();

router.get('/', kitController.getAllKits);
router.get("/count",kitController.countAllKits)
router.get('/:id', kitController.getKitById);
router.post(
  '/',
  [
    body('name').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('components').isArray(),
    body('components.*.name').notEmpty().trim(),
    body('components.*.description').notEmpty().trim(),
  ],
  kitController.createKit
);
router.put(
  '/:id',
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('status').optional().isIn(['AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST']),
    body('condition').optional().isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  ],
  kitController.updateKit
);
router.patch(
  '/:id/status',
  [
    body('status').isIn(['AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST']),
  ],
  kitController.updateKitStatus
);
router.post(
  '/:id/components',
  [
    body('name').notEmpty().trim(),
    body('description').notEmpty().trim(),
  ],
  kitController.addComponent
);
router.put(
  '/:id/components/:componentId',
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('status').optional().isIn(['PRESENT', 'MISSING', 'DAMAGED']),
    body('condition').optional().isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  ],
  kitController.updateComponent
);
router.delete('/:id/components/:componentId', kitController.removeComponent);

export { router as kitRouter };