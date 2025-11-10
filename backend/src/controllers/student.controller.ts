import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/postgreSQL';

export class StudentController {

  async countAllStudents(req:Request, res: Response){
    try {
      const result = await pool.query('SELECT COUNT (*) AS total_students FROM student_accounts')
      const totalStudents = parseInt(result.rows[0].total_students, 10)
      res.json({totalStudents})
    } catch (err) {
      console.error(err)
      res.status(500).json({error: "Failed to count Students"})
    }
  }

  async getAllStudents(req: Request, res: Response) {
    try {
      const result = await pool.query('SELECT * FROM student_accounts');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  }

  async getStudentById(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const result = await pool.query(
        'SELECT * FROM student_accounts WHERE student_id = $1',
        [studentId]
      );
      const student = result.rows[0];
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(student);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch student' });
    }
  }

  async createStudent(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { studentId, firstName, lastName, email } = req.body;

      const result = await pool.query(
        `INSERT INTO student_accounts (student_id, first_name, last_name, email)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [studentId, firstName, lastName, email]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create student' });
    }
  }

  async updateStudent(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { studentId } = req.params;
      const { firstName, lastName, email} = req.body;
      const result = await pool.query(`
        UPDATE student_accounts SET
          first_name = $1,
          last_name = $2,
          email = $3,
          updated_at = $4
        WHERE student_id = $5 RETURNING *`,
        [firstName, lastName, email, new Date(), studentId]
      );
      const updatedStudent = {
        studentId,
        ...req.body,
        updatedAt: new Date()
      };
      res.json(updatedStudent);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update student' });
    }
  }

  async updateStudentStatus(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { studentId } = req.params;
      const { status } = req.body;

      // Update the status in the database
      const result = await pool.query(
        `UPDATE student_accounts SET status = $1, updated_at = NOW() WHERE student_id = $2 RETURNING *`,
        [status, studentId]
      );

      const updatedStudent = result.rows[0];
      if (!updatedStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json(updatedStudent);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update student status' });
    }
  }

  async addStudentFlag(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { studentId } = req.params;
      const { flag } = req.body;

      // Add the flag to the student's flags array
      const result = await pool.query(
        `UPDATE student_accounts 
         SET flags = array_append(flags, $1), updated_at = NOW()
         WHERE student_id = $2
         RETURNING *`,
        [flag, studentId]
      );

      const updatedStudent = result.rows[0];
      if (!updatedStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.status(201).json(updatedStudent);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add student flag' });
    }
  }

  async removeStudentFlag(req: Request, res: Response) {
    try {
      const { studentId, flag } = req.params;

      const result = await pool.query(
        `UPDATE student_accounts
         SET flags = array_remove(flags, $1), updated_at = NOW()
         WHERE student_id = $2
         RETURNING *`,
        [flag, studentId]
      );

      if (!result.rows[0]) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.status(204).send(); // No content, update successful
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to remove student flag' });
    }
  }
}