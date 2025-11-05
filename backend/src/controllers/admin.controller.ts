import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import pool from "../config/postgreSQL"

export class AdminController {
  async getSystemConfig(req: Request, res: Response) {
    try {
      const result = await pool.query('SELECT value FROM system_config WHERE key = $1', ['global']);
      const config = result.rows[0]?.value || {};
      res.json(config);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch system configuration' });
    }
  }

  async updateSystemConfig(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const updatedConfig = req.body;
      await pool.query(
        `INSERT INTO system_config (key, value) 
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        ['global', updatedConfig]
      );

      res.json(updatedConfig);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update system configuration' });
    }
  }

  async getNotificationConfig(req: Request, res: Response) {
    try {
      const result = await pool.query('SELECT type, config FROM notification_config');
      const config = Object.fromEntries(result.rows.map((row) => [row.type.toLowerCase(), row.config]));
      res.json(config);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch notification configuration' });
    }
  }

  async updateNotificationConfig(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { type, ...config } = req.body;

    try {
      await pool.query(
        `INSERT INTO notification_config (type, config)
         VALUES ($1, $2)
         ON CONFLICT (type) DO UPDATE SET config = EXCLUDED.config`,
        [type, config]
      );

      res.json({ type, ...config });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update notification configuration' });
    }
  }

  async runDataRetention(req: Request, res: Response) {
    try {
      const retentionYears = 2; // could be read from system_config

      const deleteResult = await pool.query(
        'DELETE FROM transactions WHERE borrow_date < NOW() - INTERVAL $1 YEAR RETURNING id',
        [retentionYears]
      );

      res.json({
        recordsDeleted: deleteResult.rowCount,
        status: 'completed'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to run data retention process' });
    }
  }

  async getSystemStats(req: Request, res: Response) {
    try {
      const studentsResult = await pool.query('SELECT COUNT(*) FROM students');
      const kitsResult = await pool.query('SELECT COUNT(*) FROM kits');
      const activeLoansResult = await pool.query("SELECT COUNT(*) FROM transactions WHERE status = 'ACTIVE'");
      const overdueLoansResult = await pool.query("SELECT COUNT(*) FROM transactions WHERE status = 'OVERDUE'");
      const maintenanceItemsResult = await pool.query("SELECT COUNT(*) FROM kits WHERE status = 'MAINTENANCE'");

      res.json({
        totalStudents: parseInt(studentsResult.rows[0].count),
        totalKits: parseInt(kitsResult.rows[0].count),
        activeLoans: parseInt(activeLoansResult.rows[0].count),
        overdueLoans: parseInt(overdueLoansResult.rows[0].count),
        maintenanceItems: parseInt(maintenanceItemsResult.rows[0].count),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch system statistics' });
    }
  }
}