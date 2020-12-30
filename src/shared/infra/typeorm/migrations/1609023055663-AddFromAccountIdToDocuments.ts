import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export default class AddFromAccountIdToDocuments1609023055663
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'documents',
      new TableColumn({
        name: 'fromAccountId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'DocumentsFromAccount',
        columnNames: ['fromAccountId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('documents', 'DocumentsFromAccount');

    await queryRunner.dropColumn('documents', 'fromAccountId');
  }
}
