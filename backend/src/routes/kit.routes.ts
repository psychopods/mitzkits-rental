import { Router } from 'express';
import { body } from 'express-validator';
import { KitController } from '../controllers/kit.controller';

const router = Router();
const kitController = new KitController();

// Get all kits
router.get('/', kitController.getAllKits);

// Get kit by ID
router.get('/:id', kitController.getKitById);

// Create kit
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

// Update kit
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

// Update kit status
router.patch(
  '/:id/status',
  [
    body('status').isIn(['AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST']),
  ],
  kitController.updateKitStatus
);

// Add component to kit
router.post(
  '/:id/components',
  [
    body('name').notEmpty().trim(),
    body('description').notEmpty().trim(),
  ],
  kitController.addComponent
);

// Update component
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

// Remove component from kit
router.delete('/:id/components/:componentId', kitController.removeComponent);

export { router as kitRouter };