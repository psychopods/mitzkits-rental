"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPenaltiesToBorrowTransactions20251111120000 = void 0;
class AddPenaltiesToBorrowTransactions20251111120000 {
    constructor() {
        this.name = 'AddPenaltiesToBorrowTransactions20251111120000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "borrow_transactions" ADD COLUMN "penalties" text[] NOT NULL DEFAULT '{}'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "borrow_transactions" DROP COLUMN "penalties"`);
    }
}
exports.AddPenaltiesToBorrowTransactions20251111120000 = AddPenaltiesToBorrowTransactions20251111120000;
