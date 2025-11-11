"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowController = void 0;
const express_validator_1 = require("express-validator");
const postgreSQL_1 = __importDefault(require("../config/postgreSQL"));
class BorrowController {
    async getAllTransactions(req, res) {
        try {
            const result = await postgreSQL_1.default.query('SELECT * FROM borrow_transactions ORDER BY borrow_date DESC');
            const transactions = result.rows;
            res.json(transactions);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    }
    async getTransactionById(req, res) {
        try {
            const { id } = req.params;
            const result = await postgreSQL_1.default.query('SELECT * FROM borrow_transactions WHERE id = $1', [id]);
            const transaction = result.rows[0];
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            res.json(transaction);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch transaction' });
        }
    }
    async getStudentTransactions(req, res) {
        try {
            const { studentId } = req.params;
            const result = await postgreSQL_1.default.query('SELECT * FROM borrow_transactions WHERE student_id = $1 ORDER BY borrow_date DESC', [studentId]);
            const transactions = result.rows;
            res.json(transactions);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch student transactions' });
        }
    }
    async getKitTransactions(req, res) {
        try {
            const { kitId } = req.params;
            const result = await postgreSQL_1.default.query('SELECT * FROM borrow_transactions WHERE kit_id = $1 ORDER BY borrow_date DESC', [kitId]);
            const transactions = result.rows;
            res.json(transactions);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch kit transactions' });
        }
    }
    async createTransaction(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { studentId, kitId, initialCondition } = req.body;
        try {
            await postgreSQL_1.default.query("BEGIN");
            // 1️⃣ Verify kit availability
            const kitResult = await postgreSQL_1.default.query("SELECT * FROM kits WHERE id = $1", [kitId]);
            const kit = kitResult.rows[0];
            if (!kit || kit.status !== "AVAILABLE") {
                await postgreSQL_1.default.query("ROLLBACK");
                return res.status(400).json({ error: "Kit is not available for borrowing" });
            }
            // Create transaction
            const transactionResult = await postgreSQL_1.default.query(`INSERT INTO borrow_transactions 
           (student_id, kit_id, borrow_date, due_date, status, initial_condition)
         VALUES ($1, $2, NOW(), NOW() + INTERVAL '7 days', 'ACTIVE', $3)
         RETURNING *`, [studentId, kitId, initialCondition] // studentId -> $1, kitId -> $2, initialCondition -> $3
            );
            // 3️⃣ Update kit status
            await postgreSQL_1.default.query("UPDATE kits SET status = $1 WHERE id = $2", [
                "BORROWED",
                kitId
            ]);
            await postgreSQL_1.default.query("COMMIT");
            res.status(201).json(transactionResult.rows[0]);
        }
        catch (error) {
            await postgreSQL_1.default.query("ROLLBACK");
            console.error(error);
            res.status(500).json({ error: "Failed to create transaction" });
        }
    }
    async returnKit(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { id } = req.params;
        const { returnCondition, notes } = req.body;
        try {
            await postgreSQL_1.default.query("BEGIN");
            const result = await postgreSQL_1.default.query('SELECT * FROM borrow_transactions WHERE id = $1', [id]);
            const transaction = result.rows[0];
            if (!transaction) {
                await postgreSQL_1.default.query("ROLLBACK");
                return res.status(404).json({ error: "Transaction not found" });
            }
            if (transaction.status !== "ACTIVE") {
                await postgreSQL_1.default.query("ROLLBACK");
                return res.status(400).json({ error: "Transaction is not active" });
            }
            // 2️⃣ Initialize penalties
            const penalties = [];
            if (returnCondition !== transaction.initial_condition)
                penalties.push('DAMAGED_ITEM');
            // Update transaction (store penalties and return condition).
            // If the penalties column doesn't exist yet, fall back gracefully without it.
            let updateTx;
            try {
                updateTx = await postgreSQL_1.default.query(`UPDATE borrow_transactions
           SET return_date = NOW(),
               status = 'RETURNED',
               penalties = $1,
               notes = $2,
               return_condition = $3
           WHERE id = $4 RETURNING *`, [penalties, notes ?? null, returnCondition ?? null, id]);
            }
            catch (e) {
                if (e && e.code === '42703') {
                    // Column does not exist: run fallback update without penalties column
                    console.warn('penalties column missing on borrow_transactions; applying fallback update. Consider running the DB migration to add it.');
                    updateTx = await postgreSQL_1.default.query(`UPDATE borrow_transactions
             SET return_date = NOW(),
                 status = 'RETURNED',
                 notes = $1,
                 return_condition = $2
             WHERE id = $3 RETURNING *`, [notes ?? null, returnCondition ?? null, id]);
                }
                else {
                    throw e;
                }
            }
            // 4️⃣ Update kit status
            await postgreSQL_1.default.query("UPDATE kits SET status = $1, condition = $2 WHERE id = $3", ["AVAILABLE", returnCondition, transaction.kit_id]);
            await postgreSQL_1.default.query("COMMIT");
            res.json(updateTx.rows[0]);
        }
        catch (error) {
            await postgreSQL_1.default.query("ROLLBACK");
            console.error(error);
            res.status(500).json({ error: "Failed to process kit return" });
        }
    }
    async updateTransactionStatus(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { id } = req.params;
        const { status } = req.body;
        try {
            const result = await postgreSQL_1.default.query('UPDATE borrow_transactions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, id]);
            if (!result.rows[0])
                return res.status(404).json({ error: 'Transaction not found' });
            res.json(result.rows[0]);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update transaction status' });
        }
    }
    async getTransactionCounts(req, res) {
        try {
            // Count borrowed kits (ACTIVE transactions)
            const borrowedResult = await postgreSQL_1.default.query('SELECT COUNT(*) FROM borrow_transactions WHERE status = $1', ['ACTIVE']);
            // Count returned kits (RETURNED transactions)
            const returnedResult = await postgreSQL_1.default.query('SELECT COUNT(*) FROM borrow_transactions WHERE status = $1', ['RETURNED']);
            // Count overdue kits
            const overdueResult = await postgreSQL_1.default.query('SELECT COUNT(*) FROM borrow_transactions WHERE status = $1', ['OVERDUE']);
            // Count total transactions
            const totalResult = await postgreSQL_1.default.query('SELECT COUNT(*) FROM borrow_transactions');
            res.json({
                borrowed: parseInt(borrowedResult.rows[0].count),
                returned: parseInt(returnedResult.rows[0].count),
                overdue: parseInt(overdueResult.rows[0].count),
                total: parseInt(totalResult.rows[0].count)
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch transaction counts' });
        }
    }
}
exports.BorrowController = BorrowController;
