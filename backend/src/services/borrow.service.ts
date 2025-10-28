import { Repository } from 'typeorm';
import { AppDataSource } from '../index';
import { BorrowTransaction } from '../entities/BorrowTransaction';
import { Kit } from '../entities/Kit';
import { StudentAccount } from '../entities/StudentAccount';
import { TransactionStatus, KitStatus, AccountFlag } from '../../../shared/src/types';
import { redis } from '../index';
import { KitService } from './kit.service';
import { StudentService } from './student.service';

export class BorrowService {
  private transactionRepository: Repository<BorrowTransaction>;
  private kitService: KitService;
  private studentService: StudentService;

  constructor() {
    this.transactionRepository = AppDataSource.getRepository(BorrowTransaction);
    this.kitService = new KitService();
    this.studentService = new StudentService();
  }

  async getAllTransactions(): Promise<BorrowTransaction[]> {
    const cacheKey = 'transactions:all';
    const cachedTransactions = await redis.get(cacheKey);

    if (cachedTransactions) {
      return JSON.parse(cachedTransactions);
    }

    const transactions = await this.transactionRepository.find({
      relations: ['student', 'kit'],
    });
    await redis.set(cacheKey, JSON.stringify(transactions), 'EX', 300);
    return transactions;
  }

  async getTransactionById(id: string): Promise<BorrowTransaction | null> {
    const cacheKey = `transaction:${id}`;
    const cachedTransaction = await redis.get(cacheKey);

    if (cachedTransaction) {
      return JSON.parse(cachedTransaction);
    }

    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['student', 'kit'],
    });

    if (transaction) {
      await redis.set(cacheKey, JSON.stringify(transaction), 'EX', 300);
    }
    return transaction;
  }

  async getStudentTransactions(studentId: string): Promise<BorrowTransaction[]> {
    const cacheKey = `transactions:student:${studentId}`;
    const cachedTransactions = await redis.get(cacheKey);

    if (cachedTransactions) {
      return JSON.parse(cachedTransactions);
    }

    const transactions = await this.transactionRepository.find({
      where: { student: { id: studentId } },
      relations: ['student', 'kit'],
    });
    await redis.set(cacheKey, JSON.stringify(transactions), 'EX', 300);
    return transactions;
  }

  async createTransaction(
    studentId: string,
    kitId: string,
    initialCondition: string,
  ): Promise<BorrowTransaction> {
    // Check student account status
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    if (student.status !== 'ACTIVE') {
      throw new Error('Student account is not active');
    }

    if (student.flags.length > 0) {
      throw new Error('Student has active flags');
    }

    // Check kit availability
    const kit = await this.kitService.getKitById(kitId);
    if (!kit) {
      throw new Error('Kit not found');
    }

    if (kit.status !== KitStatus.AVAILABLE) {
      throw new Error('Kit is not available');
    }

    // Create transaction
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan period

    const transaction = this.transactionRepository.create({
      student,
      kit,
      borrowDate: new Date(),
      dueDate,
      initialCondition: initialCondition as any,
      status: TransactionStatus.ACTIVE,
    });

    await this.transactionRepository.save(transaction);
    await this.kitService.updateKitStatus(kitId, KitStatus.BORROWED);

    // Clear cache
    await redis.del('transactions:all');
    await redis.del(`transactions:student:${studentId}`);

    return transaction;
  }

  async returnKit(
    transactionId: string,
    returnCondition: string,
    notes?: string
  ): Promise<BorrowTransaction> {
    const transaction = await this.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.ACTIVE) {
      throw new Error('Transaction is not active');
    }

    // Update transaction
    transaction.returnDate = new Date();
    transaction.returnCondition = returnCondition as any;
    transaction.notes = notes;
    transaction.status = TransactionStatus.RETURNED;

    // Check for overdue
    if (transaction.returnDate > transaction.dueDate) {
      await this.studentService.addStudentFlag(transaction.student.id, AccountFlag.OVERDUE);
    }

    // Update kit status and condition
    await this.kitService.updateKit(transaction.kit.id, {
      status: KitStatus.AVAILABLE,
      condition: returnCondition as any,
    });

    await this.transactionRepository.save(transaction);

    // Clear cache
    await redis.del('transactions:all');
    await redis.del(`transaction:${transactionId}`);
    await redis.del(`transactions:student:${transaction.student.id}`);

    return transaction;
  }

  async updateTransactionStatus(
    id: string,
    status: TransactionStatus
  ): Promise<BorrowTransaction | null> {
    const transaction = await this.getTransactionById(id);
    if (!transaction) {
      return null;
    }

    transaction.status = status;

    if (status === TransactionStatus.LOST) {
      await this.kitService.updateKitStatus(transaction.kit.id, KitStatus.LOST);
      await this.studentService.addStudentFlag(transaction.student.id, AccountFlag.PAYMENT_DUE);
    }

    await this.transactionRepository.save(transaction);

    // Clear cache
    await redis.del('transactions:all');
    await redis.del(`transaction:${id}`);
    await redis.del(`transactions:student:${transaction.student.id}`);

    return transaction;
  }

  async checkOverdueTransactions(): Promise<void> {
    const now = new Date();
    const activeTransactions = await this.transactionRepository.find({
      where: { status: TransactionStatus.ACTIVE },
      relations: ['student'],
    });

    for (const transaction of activeTransactions) {
      if (transaction.dueDate < now) {
        transaction.status = TransactionStatus.OVERDUE;
        await this.transactionRepository.save(transaction);
        await this.studentService.addStudentFlag(transaction.student.id, AccountFlag.OVERDUE);
      }
    }
  }
}