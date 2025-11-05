import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Transaction } from '../models/types';
import pool from '../config/postgreSQL';

export class BorrowController {
  async getAllTransactions(req: Request, res: Response) {
    try {
      const result = await pool.query('SELECT * FROM transactions ORDER BY borrow_date DESC');
      const transactions: Transaction[] = result.rows;
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
      const transaction: Transaction | undefined = result.rows[0];

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json(transaction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }

  async getStudentTransactions(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const result = await pool.query(
        'SELECT * FROM transactions WHERE student_id = $1 ORDER BY borrow_date DESC',
        [studentId]
      );
      const transactions: Transaction[] = result.rows;
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch student transactions' });
    }
  }

  async getKitTransactions(req: Request, res: Response) {
    try {
      const { kitId } = req.params;
      const result = await pool.query(
        'SELECT * FROM transactions WHERE kit_id = $1 ORDER BY borrow_date DESC',
        [kitId]
      );
      const transactions: Transaction[] = result.rows;
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch kit transactions' });
    }
  }

  async createTransaction(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { studentId, kitId, initialCondition } = req.body;

    try {
      await pool.query('BEGIN');

      // Check if kit is available
      const kitResult = await pool.query('SELECT * FROM kits WHERE id = $1', [kitId]);
      const kit = kitResult.rows[0];
      if (!kit || kit.status !== 'AVAILABLE') {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: 'Kit is not available for borrowing' });
      }

      // Create transaction
      const transactionResult = await pool.query(
        `INSERT INTO transactions (student_id, kit_id, borrow_date, due_date, status, initial_condition)
         VALUES ($1, NOW(), NOW() + INTERVAL '7 days', 'ACTIVE', $2, $3) RETURNING *`,
        [studentId, kitId, initialCondition]
      );

      // Update kit status
      await pool.query('UPDATE kits SET status = $1 WHERE id = $2', ['BORROWED', kitId]);

      await pool.query('COMMIT');
      res.status(201).json(transactionResult.rows[0]);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  async returnKit(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { returnCondition, notes } = req.body;

    try {
      await pool.query('BEGIN');

      const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
      const transaction = result.rows[0];

      if (!transaction || transaction.status !== 'ACTIVE') {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: 'Transaction not active or not found' });
      }

      const penalties: string[] = [];
      if (returnCondition !== transaction.initial_condition) penalties.push('DAMAGED_ITEM');

      // Update transaction
      const updateTx = await pool.query(
        `UPDATE transactions
         SET return_date = NOW(), status = 'RETURNED', penalties = $1, notes = $2
         WHERE id = $3 RETURNING *`,
        [penalties, notes, id]
      );

      // Update kit status
      await pool.query('UPDATE kits SET status = $1, condition = $2 WHERE id = $3', [
        'AVAILABLE',
        returnCondition,
        transaction.kit_id
      ]);

      await pool.query('COMMIT');
      res.json(updateTx.rows[0]);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ error: 'Failed to process kit return' });
    }
  }

  async updateTransactionStatus(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status } = req.body;

    try {
      const result = await pool.query(
        'UPDATE transactions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (!result.rows[0]) return res.status(404).json({ error: 'Transaction not found' });

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update transaction status' });
    }
  }

}