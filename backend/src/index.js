"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const student_routes_1 = require("./routes/student.routes");
const kit_routes_1 = require("./routes/kit.routes");
const borrow_routes_1 = require("./routes/borrow.routes");
const admin_routes_1 = require("./routes/admin.routes");
const adminAuth_route_1 = require("./routes/adminAuth.route");
require("./config/postgreSQL");
require("./config/redisDB"); // connects automatically
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routers
app.use('/api/students', authMiddleware_1.authMiddleware, student_routes_1.studentRouter);
app.use('/api/kits', authMiddleware_1.authMiddleware, kit_routes_1.kitRouter);
app.use('/api/borrow', authMiddleware_1.authMiddleware, borrow_routes_1.borrowRouter);
app.use('/api/admin', authMiddleware_1.authMiddleware, authMiddleware_1.authorize, admin_routes_1.adminRouter);
app.use('/api/user', adminAuth_route_1.adminAuthRouter);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
async function startServer() {
    try {
        console.log('PostgreSQL connected');
        console.log('Redis client loaded (auto-connected)');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
}
startServer();
