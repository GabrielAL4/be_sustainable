import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Atualizar o nível Iniciante
  await queryInterface.bulkUpdate('Levels', {
    name: 'Iniciante',
    min_points: 0,
    max_points: 100,
    updatedAt: new Date()
  }, { id: 1 });

  // Verificar se os outros níveis existem e criar/atualizar conforme necessário
  const levels = [
    {
      id: 2,
      name: 'Intermediário',
      min_points: 101,
      max_points: 300
    },
    {
      id: 3,
      name: 'Avançado',
      min_points: 301,
      max_points: 600
    },
    {
      id: 4,
      name: 'Mestre',
      min_points: 601,
      max_points: 1000
    }
  ];

  for (const level of levels) {
    const existingLevel = await queryInterface.rawSelect('Levels', {
      where: { id: level.id }
    }, ['id']);

    if (existingLevel) {
      // Atualizar nível existente
      await queryInterface.bulkUpdate('Levels', {
        ...level,
        updatedAt: new Date()
      }, { id: level.id });
    } else {
      // Criar novo nível
      await queryInterface.bulkInsert('Levels', [{
        ...level,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Não é necessário fazer nada no down, pois não queremos reverter as atualizações
} 