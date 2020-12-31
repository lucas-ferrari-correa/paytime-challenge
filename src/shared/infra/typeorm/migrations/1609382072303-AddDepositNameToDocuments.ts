import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddDepositNameToDocuments1609382072303
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'depositName',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('documents', 'depositName');
  }
}
