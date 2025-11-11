"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const postgreSQL_1 = __importDefault(require("../config/postgreSQL"));
const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userResult = await postgreSQL_1.default.query('SELECT u.id, u.username, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [payload.userId]);
        if (!userResult.rows[0])
            return res.status(401).json({ error: 'User not found' });
        // attach user info to request
        req.user = userResult.rows[0];
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authMiddleware = authMiddleware;
const authorize = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};
exports.authorize = authorize;
