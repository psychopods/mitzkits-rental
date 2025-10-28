import { Repository } from 'typeorm';
import { AppDataSource } from '../index';
import { StudentAccount } from '../entities/StudentAccount';
import { AccountStatus, AccountFlag } from '../../../shared/src/types';
import { redis } from '../index';

export class StudentService {
  private studentRepository: Repository<StudentAccount>;

  constructor() {
    this.studentRepository = AppDataSource.getRepository(StudentAccount);
  }

  async getAllStudents(): Promise<StudentAccount[]> {
    const cacheKey = 'students:all';
    const cachedStudents = await redis.get(cacheKey);

    if (cachedStudents) {
      return JSON.parse(cachedStudents);
    }

    const students = await this.studentRepository.find();
    await redis.set(cacheKey, JSON.stringify(students), 'EX', 300); // Cache for 5 minutes
    return students;
  }

  async getStudentById(id: string): Promise<StudentAccount | null> {
    const cacheKey = `student:${id}`;
    const cachedStudent = await redis.get(cacheKey);

    if (cachedStudent) {
      return JSON.parse(cachedStudent);
    }

    const student = await this.studentRepository.findOneBy({ id });
    if (student) {
      await redis.set(cacheKey, JSON.stringify(student), 'EX', 300);
    }
    return student;
  }

  async createStudent(data: Partial<StudentAccount>): Promise<StudentAccount> {
    const student = this.studentRepository.create(data);
    await this.studentRepository.save(student);
    await redis.del('students:all');
    return student;
  }

  async updateStudent(id: string, data: Partial<StudentAccount>): Promise<StudentAccount | null> {
    await this.studentRepository.update(id, data);
    const student = await this.getStudentById(id);
    if (student) {
      await redis.del(`student:${id}`);
      await redis.del('students:all');
    }
    return student;
  }

  async updateStudentStatus(id: string, status: AccountStatus): Promise<StudentAccount | null> {
    await this.studentRepository.update(id, { status });
    const student = await this.getStudentById(id);
    if (student) {
      await redis.del(`student:${id}`);
      await redis.del('students:all');
    }
    return student;
  }

  async addStudentFlag(id: string, flag: AccountFlag): Promise<StudentAccount | null> {
    const student = await this.getStudentById(id);
    if (!student) return null;

    if (!student.flags.includes(flag)) {
      student.flags.push(flag);
      await this.studentRepository.save(student);
      await redis.del(`student:${id}`);
      await redis.del('students:all');
    }

    return student;
  }

  async removeStudentFlag(id: string, flag: AccountFlag): Promise<StudentAccount | null> {
    const student = await this.getStudentById(id);
    if (!student) return null;

    student.flags = student.flags.filter(f => f !== flag);
    await this.studentRepository.save(student);
    await redis.del(`student:${id}`);
    await redis.del('students:all');

    return student;
  }
}