"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const adminAuth_controller_1 = require("../controllers/adminAuth.controller");
const router = (0, express_1.Router)();
exports.adminAuthRouter = router;
const controller = new adminAuth_controller_1.AdminAuthController();
// Register (only super-admin can create admin)
router.post('/register', [
    (0, express_validator_1.body)('username').notEmpty(),
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('role').isIn(['ADMIN', 'MODERATOR', 'USER']),
], controller.register);
// Login
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
], controller.login);
