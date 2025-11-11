"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowService = void 0;
const BorrowTransaction_1 = require("../entities/BorrowTransaction");
const types_1 = require("../../../shared/src/types");
const kit_service_1 = require("./kit.service");
const student_service_1 = require("./student.service");
const redisDB_1 = __importDefault(require("../config/redisDB"));
const data_source_1 = __importDefault(require("../config/data-source"));
class BorrowService {
    constructor() {
        this.transactionRepository = data_source_1.default.getRepository(BorrowTransaction_1.BorrowTransaction);
        this.kitService = new kit_service_1.KitService();
        this.studentService = new student_service_1.StudentService();
    }
    async getAllTransactions() {
        const cacheKey = 'transactions:all';
        const cachedTransactions = await redisDB_1.default.get(cacheKey);
        if (cachedTransactions) {
            return JSON.parse(cachedTransactions);
        }
        const transactions = await this.transactionRepository.find({
            relations: ['student', 'kit'],
        });
        await redisDB_1.default.set(cacheKey, JSON.stringify(transactions), 'EX', 300);
        return transactions;
    }
    async getTransactionById(id) {
        const cacheKey = `transaction:${id}`;
        const cachedTransaction = await redisDB_1.default.get(cacheKey);
        if (cachedTransaction) {
            return JSON.parse(cachedTransaction);
        }
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: ['student', 'kit'],
        });
        if (transaction) {
            await redisDB_1.default.set(cacheKey, JSON.stringify(transaction), 'EX', 300);
        }
        return transaction;
    }
    async getStudentTransactions(studentId) {
        const cacheKey = `transactions:student:${studentId}`;
        const cachedTransactions = await redisDB_1.default.get(cacheKey);
        if (cachedTransactions) {
            return JSON.parse(cachedTransactions);
        }
        const transactions = await this.transactionRepository.find({
            where: { student: { id: studentId } },
            relations: ['student', 'kit'],
        });
        await redisDB_1.default.set(cacheKey, JSON.stringify(transactions), 'EX', 300);
        return transactions;
    }
    async createTransaction(studentId, kitId, initialCondition) {
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
        if (kit.status !== types_1.KitStatus.AVAILABLE) {
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
            initialCondition: initialCondition,
            status: types_1.TransactionStatus.ACTIVE,
        });
        await this.transactionRepository.save(transaction);
        await this.kitService.updateKitStatus(kitId, types_1.KitStatus.BORROWED);
        // Clear cache
        await redisDB_1.default.del('transactions:all');
        await redisDB_1.default.del(`transactions:student:${studentId}`);
        return transaction;
    }
    async returnKit(transactionId, returnCondition, notes) {
        const transaction = await this.getTransactionById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        if (transaction.status !== types_1.TransactionStatus.ACTIVE) {
            throw new Error('Transaction is not active');
        }
        // Update transaction
        transaction.returnDate = new Date();
        transaction.returnCondition = returnCondition;
        transaction.notes = notes;
        transaction.status = types_1.TransactionStatus.RETURNED;
        // Check for overdue
        if (transaction.returnDate > transaction.dueDate) {
            await this.studentService.addStudentFlag(transaction.student.id, types_1.AccountFlag.OVERDUE);
        }
        // Update kit status and condition
        await this.kitService.updateKit(transaction.kit.id, {
            status: types_1.KitStatus.AVAILABLE,
            condition: returnCondition,
        });
        await this.transactionRepository.save(transaction);
        // Clear cache
        await redisDB_1.default.del('transactions:all');
        await redisDB_1.default.del(`transaction:${transactionId}`);
        await redisDB_1.default.del(`transactions:student:${transaction.student.id}`);
        return transaction;
    }
    async updateTransactionStatus(id, status) {
        const transaction = await this.getTransactionById(id);
        if (!transaction) {
            return null;
        }
        transaction.status = status;
        if (status === types_1.TransactionStatus.LOST) {
            await this.kitService.updateKitStatus(transaction.kit.id, types_1.KitStatus.LOST);
            await this.studentService.addStudentFlag(transaction.student.id, types_1.AccountFlag.PAYMENT_DUE);
        }
        await this.transactionRepository.save(transaction);
        // Clear cache
        await redisDB_1.default.del('transactions:all');
        await redisDB_1.default.del(`transaction:${id}`);
        await redisDB_1.default.del(`transactions:student:${transaction.student.id}`);
        return transaction;
    }
    async checkOverdueTransactions() {
        const now = new Date();
        const activeTransactions = await this.transactionRepository.find({
            where: { status: types_1.TransactionStatus.ACTIVE },
            relations: ['student'],
        });
        for (const transaction of activeTransactions) {
            if (transaction.dueDate < now) {
                transaction.status = types_1.TransactionStatus.OVERDUE;
                await this.transactionRepository.save(transaction);
                await this.studentService.addStudentFlag(transaction.student.id, types_1.AccountFlag.OVERDUE);
            }
        }
    }
}
exports.BorrowService = BorrowService;
