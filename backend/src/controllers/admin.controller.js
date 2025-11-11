"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const express_validator_1 = require("express-validator");
const postgreSQL_1 = __importDefault(require("../config/postgreSQL"));
class AdminController {
    async getSystemConfig(req, res) {
        try {
            const result = await postgreSQL_1.default.query('SELECT value FROM system_config WHERE key = $1', ['global']);
            const config = result.rows[0]?.value || {};
            res.json(config);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch system configuration' });
        }
    }
    async updateSystemConfig(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        try {
            const updatedConfig = req.body;
            await postgreSQL_1.default.query(`INSERT INTO system_config (key, value) 
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, ['global', updatedConfig]);
            res.json(updatedConfig);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update system configuration' });
        }
    }
    async getNotificationConfig(req, res) {
        try {
            const result = await postgreSQL_1.default.query('SELECT type, config FROM notification_config');
            const config = Object.fromEntries(result.rows.map((row) => [row.type.toLowerCase(), row.config]));
            res.json(config);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch notification configuration' });
        }
    }
    async updateNotificationConfig(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { type, ...config } = req.body;
        try {
            await postgreSQL_1.default.query(`INSERT INTO notification_config (type, config)
         VALUES ($1, $2)
         ON CONFLICT (type) DO UPDATE SET config = EXCLUDED.config`, [type, config]);
            res.json({ type, ...config });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update notification configuration' });
        }
    }
    async runDataRetention(req, res) {
        try {
            const retentionYears = 2; // could be read from system_config
            const deleteResult = await postgreSQL_1.default.query('DELETE FROM transactions WHERE borrow_date < NOW() - INTERVAL $1 YEAR RETURNING id', [retentionYears]);
            res.json({
                recordsDeleted: deleteResult.rowCount,
                status: 'completed'
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to run data retention process' });
        }
    }
    async getSystemStats(req, res) {
        try {
            const studentsResult = await postgreSQL_1.default.query('SELECT COUNT(*) FROM students');
            const kitsResult = await postgreSQL_1.default.query('SELECT COUNT(*) FROM kits');
            const activeLoansResult = await postgreSQL_1.default.query("SELECT COUNT(*) FROM transactions WHERE status = 'ACTIVE'");
            const overdueLoansResult = await postgreSQL_1.default.query("SELECT COUNT(*) FROM transactions WHERE status = 'OVERDUE'");
            const maintenanceItemsResult = await postgreSQL_1.default.query("SELECT COUNT(*) FROM kits WHERE status = 'MAINTENANCE'");
            res.json({
                totalStudents: parseInt(studentsResult.rows[0].count),
                totalKits: parseInt(kitsResult.rows[0].count),
                activeLoans: parseInt(activeLoansResult.rows[0].count),
                overdueLoans: parseInt(overdueLoansResult.rows[0].count),
                maintenanceItems: parseInt(maintenanceItemsResult.rows[0].count),
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch system statistics' });
        }
    }
}
exports.AdminController = AdminController;
