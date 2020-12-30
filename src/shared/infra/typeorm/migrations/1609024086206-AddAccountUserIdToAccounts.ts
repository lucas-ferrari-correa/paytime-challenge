import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export default class AddAccountUserIdToAccounts1609024086206
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'accounts',
      new TableColumn({
        name: 'accountUserId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'accounts',
      new TableForeignKey({
        name: 'AccountsAccount',
        columnNames: ['accountUserId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('accounts', 'AccountsAccount');

    await queryRunner.dropColumn('accounts', 'accountUserId');
  }
}
