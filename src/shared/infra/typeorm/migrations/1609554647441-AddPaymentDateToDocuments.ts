import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddPaymentDateToDocuments1609554647441
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'paymentDate',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('documents', 'paymentDate');
  }
}
