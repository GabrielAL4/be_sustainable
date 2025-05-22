import Task from '../models/Task';

async function seedTasks() {
  try {
    await Task.bulkCreate([
      {
        title: 'Separar e reciclar o lixo corretamente',
        description: 'Separe o lixo corretamente nas lixeiras destinadas a descarte sustentavel.',
        points: 50,
        user_id: null,
        completed: false
      },
      {
        title: 'Utilizar copos/canecas reutilizaveis',
        description: 'Utilize copos reutilizaveis durante o dia para evitar o escarte de plastico desnecessario.',
        points: 25,
        user_id: null,
        completed: false
      }
    ]);
    console.log('Tasks criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tasks:', error);
  }
}

seedTasks(); 