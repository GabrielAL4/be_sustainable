import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.DB_HOST || 'localhost';
const database = process.env.DB_NAME || 'be_sustainable';
const username = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASS || 'postgres';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host,
  port: 5432,
  database,
  username,
  password,
  logging: console.log,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Forçar a recriação das tabelas
    await sequelize.sync({ force: true });
    console.log('Database tables recreated successfully');

    // Importar o modelo Level diretamente
    const { default: Level } = await import('../models/Level');

    // Criar níveis padrão
    await Level.bulkCreate([
      { name: 'Iniciante', min_points: 0, max_points: 100 },
      { name: 'Intermediário', min_points: 101, max_points: 300 },
      { name: 'Avançado', min_points: 301, max_points: 600 },
      { name: 'Expert', min_points: 601, max_points: 1000 }
    ]);
    console.log('Default levels created successfully');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}; 