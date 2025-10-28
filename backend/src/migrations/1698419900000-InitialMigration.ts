import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1698419900000 implements MigrationInterface {
  name = 'InitialMigration1698419900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "account_status_enum" AS ENUM (
        'ACTIVE',
        'INACTIVE',
        'FROZEN',
        'DEACTIVATED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "kit_status_enum" AS ENUM (
        'AVAILABLE',
        'BORROWED',
        'MAINTENANCE',
        'LOST'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "kit_condition_enum" AS ENUM (
        'EXCELLENT',
        'GOOD',
        'FAIR',
        'POOR',
        'DAMAGED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "component_status_enum" AS ENUM (
        'PRESENT',
        'MISSING',
        'DAMAGED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "transaction_status_enum" AS ENUM (
        'ACTIVE',
        'RETURNED',
        'OVERDUE',
        'LOST'
      )
    `);

    // Create student_accounts table
    await queryRunner.query(`
      CREATE TABLE "student_accounts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "student_id" varchar NOT NULL UNIQUE,
        "first_name" varchar NOT NULL,
        "last_name" varchar NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "status" account_status_enum NOT NULL DEFAULT 'ACTIVE',
        "flags" text[] NOT NULL DEFAULT '{}',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create kits table
    await queryRunner.query(`
      CREATE TABLE "kits" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "description" text NOT NULL,
        "status" kit_status_enum NOT NULL DEFAULT 'AVAILABLE',
        "condition" kit_condition_enum NOT NULL DEFAULT 'EXCELLENT',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create kit_components table
    await queryRunner.query(`
      CREATE TABLE "kit_components" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "kit_id" uuid NOT NULL REFERENCES kits(id),
        "name" varchar NOT NULL,
        "description" text NOT NULL,
        "status" component_status_enum NOT NULL DEFAULT 'PRESENT',
        "condition" kit_condition_enum NOT NULL DEFAULT 'EXCELLENT',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create borrow_transactions table
    await queryRunner.query(`
      CREATE TABLE "borrow_transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "student_id" uuid NOT NULL REFERENCES student_accounts(id),
        "kit_id" uuid NOT NULL REFERENCES kits(id),
        "borrow_date" timestamp NOT NULL,
        "due_date" timestamp NOT NULL,
        "return_date" timestamp,
        "initial_condition" kit_condition_enum NOT NULL,
        "return_condition" kit_condition_enum,
        "status" transaction_status_enum NOT NULL DEFAULT 'ACTIVE',
        "notes" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_student_email" ON "student_accounts"("email");
      CREATE INDEX "idx_student_status" ON "student_accounts"("status");
      CREATE INDEX "idx_kit_status" ON "kits"("status");
      CREATE INDEX "idx_kit_condition" ON "kits"("condition");
      CREATE INDEX "idx_borrow_transaction_status" ON "borrow_transactions"("status");
      CREATE INDEX "idx_borrow_transaction_dates" ON "borrow_transactions"("borrow_date", "due_date", "return_date");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_borrow_transaction_dates"`);
    await queryRunner.query(`DROP INDEX "idx_borrow_transaction_status"`);
    await queryRunner.query(`DROP INDEX "idx_kit_condition"`);
    await queryRunner.query(`DROP INDEX "idx_kit_status"`);
    await queryRunner.query(`DROP INDEX "idx_student_status"`);
    await queryRunner.query(`DROP INDEX "idx_student_email"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "borrow_transactions"`);
    await queryRunner.query(`DROP TABLE "kit_components"`);
    await queryRunner.query(`DROP TABLE "kits"`);
    await queryRunner.query(`DROP TABLE "student_accounts"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "component_status_enum"`);
    await queryRunner.query(`DROP TYPE "kit_condition_enum"`);
    await queryRunner.query(`DROP TYPE "kit_status_enum"`);
    await queryRunner.query(`DROP TYPE "account_status_enum"`);
  }
}