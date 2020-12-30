import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateDocuments1609018564038
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'document',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'type',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            isNullable: false,
          },
          {
            name: 'paymentStatus',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'dueDate',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'paymentPenalty',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'interest',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'interestType',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'finalAmount',
            type: 'decimal',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('documents');
  }
}
