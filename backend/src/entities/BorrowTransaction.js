"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowTransaction = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../shared/src/types");
const StudentAccount_1 = require("./StudentAccount");
const Kit_1 = require("./Kit");
let BorrowTransaction = class BorrowTransaction {
};
exports.BorrowTransaction = BorrowTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BorrowTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StudentAccount_1.StudentAccount),
    __metadata("design:type", StudentAccount_1.StudentAccount)
], BorrowTransaction.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Kit_1.Kit),
    __metadata("design:type", Kit_1.Kit)
], BorrowTransaction.prototype, "kit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], BorrowTransaction.prototype, "borrowDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], BorrowTransaction.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], BorrowTransaction.prototype, "returnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.KitCondition
    }),
    __metadata("design:type", String)
], BorrowTransaction.prototype, "initialCondition", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.KitCondition,
        nullable: true
    }),
    __metadata("design:type", String)
], BorrowTransaction.prototype, "returnCondition", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.TransactionStatus,
        default: types_1.TransactionStatus.ACTIVE
    }),
    __metadata("design:type", String)
], BorrowTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], BorrowTransaction.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: '{}' }),
    __metadata("design:type", Array)
], BorrowTransaction.prototype, "penalties", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BorrowTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BorrowTransaction.prototype, "updatedAt", void 0);
exports.BorrowTransaction = BorrowTransaction = __decorate([
    (0, typeorm_1.Entity)('borrow_transactions')
], BorrowTransaction);
