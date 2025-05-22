import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkInsert('Levels', [{
    id: 1,
    name: 'Iniciante',
    min_points: 0,
    max_points: 100,
    createdAt: new Date(),
    updatedAt: new Date()
  }], {});
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('Levels', { id: 1 }, {});
} 