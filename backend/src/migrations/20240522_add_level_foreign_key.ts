import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addConstraint('Users', {
    fields: ['level_id'],
    type: 'foreign key',
    name: 'Users_level_id_fkey',
    references: {
      table: 'Levels',
      field: 'id',
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeConstraint('Users', 'Users_level_id_fkey');
} 