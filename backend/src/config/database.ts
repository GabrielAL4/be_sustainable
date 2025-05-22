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
    
    // Sync database without force
    await sequelize.sync();
    console.log('Database tables synced successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}; 