import { sequelize } from '../config/database';
import Task from '../models/Task';

async function seedTasks() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Create tasks
    const task1 = await Task.create({
      title: 'Separar e reciclar o lixo corretamente',
      description: 'Separe o lixo corretamente nas lixeiras destinadas a descarte sustentavel.',
      points: 50,
      user_id: null,
      completed: false
    });

    const task2 = await Task.create({
      title: 'Utilizar copos/canecas reutilizaveis',
      description: 'Utilize copos reutilizaveis durante o dia para evitar o escarte de plastico desnecessario.',
      points: 25,
      user_id: null,
      completed: false
    });

    console.log('Tasks criadas com sucesso:', [task1, task2]);
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar tasks:', error);
    process.exit(1);
  }
}

seedTasks(); 