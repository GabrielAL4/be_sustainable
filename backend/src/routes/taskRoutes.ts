import { Router } from 'express';
import { Op, Sequelize } from 'sequelize';
import Task from '../models/Task';
import User from '../models/User';
import Level from '../models/Level';

const router = Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
});

// Get random tasks
router.get('/random', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 4;
    const tasks = await Task.findAll({
      order: Sequelize.literal('RANDOM()'),
      limit: limit
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching random tasks', error });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, points, user_id } = req.body;
    
    // Validate required fields
    if (!title || !description || points === undefined) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: {
          details: {
            title: !title ? 'Title is required' : null,
            description: !description ? 'Description is required' : null,
            points: points === undefined ? 'Points is required' : null
          }
        }
      });
    }

    // Validate points is a number
    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json({
        message: 'Invalid points value',
        error: {
          details: {
            points: 'Points must be a positive number'
          }
        }
      });
    }

    console.log('Creating task with data:', { title, description, points, user_id }); // Debug log
    
    const task = await Task.create({
      title,
      description,
      points,
      user_id: user_id || null,
      completed: false // Explicitly set default value
    });

    console.log('Task created successfully:', task.toJSON()); // Debug log
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error); // Debug log
    res.status(500).json({
      message: 'Error creating task',
      error: {
        name: error.name,
        errors: error.errors?.map(e => ({
          message: e.message,
          field: e.path,
          value: e.value
        }))
      }
    });
  }
});

// Get all tasks for a user
router.get('/user/:userId', async (req, res) => {
  try {
    console.log('Buscando tasks para usuário:', req.params.userId);
    
    // Calcular a data limite de 24 horas atrás
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Buscar todas as tasks disponíveis que:
    // 1. Não estão completadas, OU
    // 2. Foram completadas por este usuário nas últimas 24 horas
    const tasks = await Task.findAll({
      where: {
        [Op.or]: [
          // Tasks não completadas
          { completed: false },
          // Tasks completadas por este usuário nas últimas 24 horas
          {
            completed: true,
            user_id: req.params.userId,
            updatedAt: { [Op.gte]: oneDayAgo }
          }
        ]
      },
      order: [
        ['completed', 'ASC'], // Tasks não completadas primeiro
        Sequelize.literal('RANDOM()') // Randomizar dentro de cada grupo
      ],
      limit: 4
    });

    console.log('Tasks encontradas:', tasks.length);
    console.log('Tasks filtradas:', tasks.map(t => ({
      id: t.id,
      title: t.title,
      completed: t.completed,
      user_id: t.user_id,
      updatedAt: t.updatedAt
    })));
    
    res.json(tasks);
  } catch (error: any) {
    console.error('Erro ao buscar tasks:', error);
    res.status(500).json({ 
      message: 'Error fetching tasks', 
      error: {
        name: error.name,
        errors: error.errors?.map((e: any) => ({
          message: e.message,
          field: e.path,
          value: e.value
        }))
      }
    });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, points } = req.body;
    await task.update({ title, description, points });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
});

// Update task completion status
router.put('/:id/complete', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Pegar o user_id do corpo da requisição
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Verificar se a task já foi completada
    if (task.completed && task.user_id) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    // Marcar a task como completada e associar ao usuário
    task.completed = true;
    task.user_id = user_id; // Registrar qual usuário completou
    await task.save();

    // Update user points and XP
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Adicionar pontos e XP
    user.points += task.points;
    user.xp += task.points;
    await user.save();

    // Buscar informações atualizadas do nível
    const currentLevel = await Level.findByPk(user.level_id);
    
    res.json({ 
      task,
      user: {
        points: user.points,
        xp: user.xp,
        level: currentLevel?.name,
        level_progress: currentLevel ? {
          current: user.xp - currentLevel.min_points,
          total: currentLevel.max_points - currentLevel.min_points
        } : null
      }
    });
  } catch (error: any) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Error completing task', error });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
});

export default router; 