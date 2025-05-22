import { sequelize } from '../config/database';
import Level from '../models/Level';

async function seedLevels() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Criar níveis padrão
    const levels = await Level.bulkCreate([
      {
        name: 'Iniciante',
        min_points: 0,
        max_points: 100
      },
      {
        name: 'Consciente',
        min_points: 100,
        max_points: 300
      },
      {
        name: 'Sustentável',
        min_points: 300,
        max_points: 600
      },
      {
        name: 'Eco Warrior',
        min_points: 600,
        max_points: 1000
      },
      {
        name: 'Earth Guardian',
        min_points: 1000,
        max_points: 1500
      },
      {
        name: 'Planet Savior',
        min_points: 1500,
        max_points: 2000
      },
      {
        name: 'Eco Legend',
        min_points: 2000,
        max_points: 999999
      }
    ]);

    console.log('Níveis criados com sucesso:', levels);
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar níveis:', error);
    process.exit(1);
  }
}

seedLevels(); 