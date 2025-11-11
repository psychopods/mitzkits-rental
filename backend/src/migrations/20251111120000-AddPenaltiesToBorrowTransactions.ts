import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPenaltiesToBorrowTransactions20251111120000 implements MigrationInterface {
  name = 'AddPenaltiesToBorrowTransactions20251111120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "borrow_transactions" ADD COLUMN "penalties" text[] NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "borrow_transactions" DROP COLUMN "penalties"`);
  }
}
