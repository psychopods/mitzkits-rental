"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kitRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const kit_controller_1 = require("../controllers/kit.controller");
const router = (0, express_1.Router)();
exports.kitRouter = router;
const kitController = new kit_controller_1.KitController();
router.get('/', kitController.getAllKits);
router.get("/count", kitController.countAllKits);
router.get('/:id', kitController.getKitById);
router.post('/', [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('description').notEmpty().trim(),
    (0, express_validator_1.body)('components').isArray(),
    (0, express_validator_1.body)('components.*.name').notEmpty().trim(),
    (0, express_validator_1.body)('components.*.description').notEmpty().trim(),
], kitController.createKit);
router.put('/:id', [
    (0, express_validator_1.body)('name').optional().trim(),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('status').optional().isIn(['AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST']),
    (0, express_validator_1.body)('condition').optional().isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
], kitController.updateKit);
router.patch('/:id/status', [
    (0, express_validator_1.body)('status').isIn(['AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST']),
], kitController.updateKitStatus);
router.post('/:id/components', [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('description').notEmpty().trim(),
], kitController.addComponent);
router.put('/:id/components/:componentId', [
    (0, express_validator_1.body)('name').optional().trim(),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('status').optional().isIn(['PRESENT', 'MISSING', 'DAMAGED']),
    (0, express_validator_1.body)('condition').optional().isIn(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
], kitController.updateComponent);
router.delete('/:id/components/:componentId', kitController.removeComponent);
