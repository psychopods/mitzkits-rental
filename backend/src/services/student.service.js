"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const data_source_1 = __importDefault(require("../config/data-source"));
const StudentAccount_1 = require("../entities/StudentAccount");
const redisDB_1 = __importDefault(require("../config/redisDB"));
class StudentService {
    constructor() {
        this.studentRepository = data_source_1.default.getRepository(StudentAccount_1.StudentAccount);
    }
    async getAllStudents() {
        const cacheKey = 'students:all';
        const cachedStudents = await redisDB_1.default.get(cacheKey);
        if (cachedStudents) {
            return JSON.parse(cachedStudents);
        }
        const students = await this.studentRepository.find();
        await redisDB_1.default.set(cacheKey, JSON.stringify(students), 'EX', 300); // Cache for 5 minutes
        return students;
    }
    async getStudentById(id) {
        const cacheKey = `student:${id}`;
        const cachedStudent = await redisDB_1.default.get(cacheKey);
        if (cachedStudent) {
            return JSON.parse(cachedStudent);
        }
        const student = await this.studentRepository.findOneBy({ id });
        if (student) {
            await redisDB_1.default.set(cacheKey, JSON.stringify(student), 'EX', 300);
        }
        return student;
    }
    async createStudent(data) {
        const student = this.studentRepository.create(data);
        await this.studentRepository.save(student);
        await redisDB_1.default.del('students:all');
        return student;
    }
    async updateStudent(id, data) {
        await this.studentRepository.update(id, data);
        const student = await this.getStudentById(id);
        if (student) {
            await redisDB_1.default.del(`student:${id}`);
            await redisDB_1.default.del('students:all');
        }
        return student;
    }
    async updateStudentStatus(id, status) {
        await this.studentRepository.update(id, { status });
        const student = await this.getStudentById(id);
        if (student) {
            await redisDB_1.default.del(`student:${id}`);
            await redisDB_1.default.del('students:all');
        }
        return student;
    }
    async addStudentFlag(id, flag) {
        const student = await this.getStudentById(id);
        if (!student)
            return null;
        if (!student.flags.includes(flag)) {
            student.flags.push(flag);
            await this.studentRepository.save(student);
            await redisDB_1.default.del(`student:${id}`);
            await redisDB_1.default.del('students:all');
        }
        return student;
    }
    async removeStudentFlag(id, flag) {
        const student = await this.getStudentById(id);
        if (!student)
            return null;
        student.flags = student.flags.filter(f => f !== flag);
        await this.studentRepository.save(student);
        await redisDB_1.default.del(`student:${id}`);
        await redisDB_1.default.del('students:all');
        return student;
    }
}
exports.StudentService = StudentService;
