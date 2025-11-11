"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const express_validator_1 = require("express-validator");
const postgreSQL_1 = __importDefault(require("../config/postgreSQL"));
class StudentController {
    async countAllStudents(req, res) {
        try {
            const result = await postgreSQL_1.default.query('SELECT COUNT (*) AS total_students FROM student_accounts');
            const totalStudents = parseInt(result.rows[0].total_students, 10);
            res.json({ totalStudents });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to count Students" });
        }
    }
    async getAllStudents(req, res) {
        try {
            const result = await postgreSQL_1.default.query('SELECT * FROM student_accounts');
            res.json(result.rows);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch students' });
        }
    }
    async getStudentById(req, res) {
        try {
            const { studentId } = req.params;
            const result = await postgreSQL_1.default.query('SELECT * FROM student_accounts WHERE student_id = $1', [studentId]);
            const student = result.rows[0];
            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }
            res.json(student);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch student' });
        }
    }
    async createStudent(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { studentId, firstName, lastName, email } = req.body;
            const result = await postgreSQL_1.default.query(`INSERT INTO student_accounts (student_id, first_name, last_name, email)
         VALUES ($1, $2, $3, $4) RETURNING *`, [studentId, firstName, lastName, email]);
            res.status(201).json(result.rows[0]);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create student' });
        }
    }
    async updateStudent(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { studentId } = req.params;
            const { firstName, lastName, email } = req.body;
            const result = await postgreSQL_1.default.query(`
        UPDATE student_accounts SET
          first_name = $1,
          last_name = $2,
          email = $3,
          updated_at = $4
        WHERE student_id = $5 RETURNING *`, [firstName, lastName, email, new Date(), studentId]);
            const updatedStudent = {
                studentId,
                ...req.body,
                updatedAt: new Date()
            };
            res.json(updatedStudent);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update student' });
        }
    }
    async updateStudentStatus(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { studentId } = req.params;
            const { status } = req.body;
            // Update the status in the database
            const result = await postgreSQL_1.default.query(`UPDATE student_accounts SET status = $1, updated_at = NOW() WHERE student_id = $2 RETURNING *`, [status, studentId]);
            const updatedStudent = result.rows[0];
            if (!updatedStudent) {
                return res.status(404).json({ error: 'Student not found' });
            }
            res.json(updatedStudent);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update student status' });
        }
    }
    async addStudentFlag(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { studentId } = req.params;
            const { flag } = req.body;
            // Add the flag to the student's flags array
            const result = await postgreSQL_1.default.query(`UPDATE student_accounts 
         SET flags = array_append(flags, $1), updated_at = NOW()
         WHERE student_id = $2
         RETURNING *`, [flag, studentId]);
            const updatedStudent = result.rows[0];
            if (!updatedStudent) {
                return res.status(404).json({ error: 'Student not found' });
            }
            res.status(201).json(updatedStudent);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to add student flag' });
        }
    }
    async removeStudentFlag(req, res) {
        try {
            const { studentId, flag } = req.params;
            const result = await postgreSQL_1.default.query(`UPDATE student_accounts
         SET flags = array_remove(flags, $1), updated_at = NOW()
         WHERE student_id = $2
         RETURNING *`, [flag, studentId]);
            if (!result.rows[0]) {
                return res.status(404).json({ error: 'Student not found' });
            }
            res.status(204).send(); // No content, update successful
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to remove student flag' });
        }
    }
}
exports.StudentController = StudentController;
