"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitController = void 0;
const express_validator_1 = require("express-validator");
const postgreSQL_1 = __importDefault(require("../config/postgreSQL"));
class KitController {
    async countAllKits(req, res) {
        try {
            const result = await postgreSQL_1.default.query('SELECT COUNT (*) AS total_kits FROM kits');
            const totalKits = parseInt(result.rows[0].total_kits, 10);
            res.json({ totalKits });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to Count Kits" });
        }
    }
    async getAllKits(req, res) {
        try {
            const result = await postgreSQL_1.default.query('SELECT * FROM kits');
            res.json(result.rows);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch kits' });
        }
    }
    async getKitById(req, res) {
        try {
            const { id } = req.params;
            // TODO: Implement fetching kit by ID from database
            const result = await postgreSQL_1.default.query('SELECT * FROM kits WHERE id = $1', [id]);
            const kit = result.rows[0];
            if (!kit) {
                return res.status(404).json({ error: 'Kit not found' });
            }
            res.json(kit);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch kit' });
        }
    }
    async createKit(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, description, components } = req.body;
        try {
            await postgreSQL_1.default.query('BEGIN');
            const kitResult = await postgreSQL_1.default.query(`INSERT INTO kits (name, description, status, condition, created_at, updated_at)
         VALUES ($1, $2, 'AVAILABLE', 'EXCELLENT', NOW(), NOW())
         RETURNING *`, [name, description]);
            const newKit = kitResult.rows[0];
            for (const component of components) {
                await postgreSQL_1.default.query(`INSERT INTO kit_components (kit_id, name, description, status, condition, created_at, updated_at)
           VALUES ($1, $2, $3, 'PRESENT', 'EXCELLENT', NOW(), NOW())`, [newKit.id, component.name, component.description]);
            }
            await postgreSQL_1.default.query('COMMIT');
            const compResult = await postgreSQL_1.default.query(`SELECT * FROM kit_components WHERE kit_id = $1`, [newKit.id]);
            newKit.components = compResult.rows;
            res.status(201).json(newKit);
        }
        catch (error) {
            await postgreSQL_1.default.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ error: 'Failed to create kit' });
        }
    }
    async updateKit(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { id } = req.params;
            const { name, description, status, condition } = req.body;
            // Build dynamic query
            const fields = [];
            const values = [];
            let idx = 1;
            if (name) {
                fields.push(`name = $${idx++}`);
                values.push(name);
            }
            if (description) {
                fields.push(`description = $${idx++}`);
                values.push(description);
            }
            if (status) {
                fields.push(`status = $${idx++}`);
                values.push(status);
            }
            if (condition) {
                fields.push(`condition = $${idx++}`);
                values.push(condition);
            }
            if (fields.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }
            // Add updatedAt
            fields.push(`updated_at = NOW()`);
            const query = `
        UPDATE kits
        SET ${fields.join(', ')}
        WHERE id = $${idx}
        RETURNING *
      `;
            values.push(id);
            const result = await postgreSQL_1.default.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Kit not found' });
            }
            res.json(result.rows[0]);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update kit' });
        }
    }
    async updateKitStatus(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await postgreSQL_1.default.query(`UPDATE kits 
         SET status = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING *`, [status, id]);
            const updatedKit = result.rows[0];
            if (!updatedKit) {
                return res.status(404).json({ error: 'Kit not found' });
            }
            res.json(updatedKit);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update kit status' });
        }
    }
    async addComponent(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { id } = req.params; // this is the kit ID
            const { name, description } = req.body;
            const result = await postgreSQL_1.default.query(`INSERT INTO kit_components
         (kit_id, name, description, status, condition, created_at, updated_at)
         VALUES ($1, $2, $3, 'PRESENT', 'EXCELLENT', NOW(), NOW())
         RETURNING *`, [id, name, description]);
            res.status(201).json(result.rows[0]);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to add component' });
        }
    }
    async updateComponent(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { id, componentId } = req.params; // id = kitId, componentId = component ID
            const { name, description, status, condition } = req.body;
            const fields = [];
            const values = [];
            let idx = 1;
            if (name !== undefined) {
                fields.push(`name = $${idx++}`);
                values.push(name);
            }
            if (description !== undefined) {
                fields.push(`description = $${idx++}`);
                values.push(description);
            }
            if (status !== undefined) {
                fields.push(`status = $${idx++}`);
                values.push(status);
            }
            if (condition !== undefined) {
                fields.push(`condition = $${idx++}`);
                values.push(condition);
            }
            if (fields.length === 0) {
                return res.status(400).json({ error: "No fields to update" });
            }
            fields.push(`updated_at = NOW()`);
            const query = `
        UPDATE kit_components
        SET ${fields.join(', ')}
        WHERE id = $${idx} AND kit_id = $${idx + 1}
        RETURNING *
      `;
            values.push(componentId, id);
            const result = await postgreSQL_1.default.query(query, values);
            const updatedComponent = result.rows[0];
            if (!updatedComponent) {
                return res.status(404).json({ error: "Component not found" });
            }
            res.json(updatedComponent);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to update component" });
        }
    }
    async removeComponent(req, res) {
        try {
            const { id, componentId } = req.params; // id = kitId
            const result = await postgreSQL_1.default.query('DELETE FROM kit_components WHERE id = $1 AND kit_id = $2 RETURNING *', [componentId, id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Component not found' });
            }
            res.status(204).send(); // No content on successful deletion
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to remove component' });
        }
    }
}
exports.KitController = KitController;
