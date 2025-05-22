import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Primeiro, limpar a tabela Levels
  await queryInterface.bulkDelete('Levels', {}, {});

  // Depois, inserir os níveis novamente
  await queryInterface.bulkInsert('Levels', [
    {
      id: 1,
      name: 'Iniciante',
      min_points: 0,
      max_points: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: 'Intermediário',
      min_points: 101,
      max_points: 300,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      name: 'Avançado',
      min_points: 301,
      max_points: 600,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      name: 'Mestre',
      min_points: 601,
      max_points: 1000,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ], {});
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('Levels', {}, {});
} 