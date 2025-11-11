"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const postgreSQL_1 = __importDefault(require("../config/postgreSQL"));
class AdminAuthController {
    async register(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        try {
            const { username, email, password, role } = req.body;
            // check if user exists
            const existing = await postgreSQL_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existing.rows.length)
                return res.status(400).json({ error: 'User already exists' });
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            // find role id
            const roleResult = await postgreSQL_1.default.query('SELECT id FROM roles WHERE name = $1', [role]);
            if (!roleResult.rows[0])
                return res.status(400).json({ error: 'Invalid role' });
            const result = await postgreSQL_1.default.query('INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email', [username, email, hashedPassword, roleResult.rows[0].id]);
            res.status(201).json(result.rows[0]);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to register user' });
        }
    }
    async login(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        try {
            const { email, password } = req.body;
            const userResult = await postgreSQL_1.default.query('SELECT u.id, u.username, u.password, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1', [email]);
            if (!userResult.rows[0])
                return res.status(400).json({ error: 'Invalid credentials' });
            const user = userResult.rows[0];
            const valid = await bcrypt_1.default.compare(password, user.password);
            if (!valid)
                return res.status(400).json({ error: 'Invalid credentials' });
            const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, role: user.role });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
}
exports.AdminAuthController = AdminAuthController;
