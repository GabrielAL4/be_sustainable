import { Router } from 'express';
import Task from '../models/Task';
import User from '../models/User';
import { Sequelize } from 'sequelize';
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
    
    // Primeiro, buscar as tasks específicas do usuário
    const userTasks = await Task.findAll({
      where: { user_id: req.params.userId }
    });
    
    // Depois, buscar tasks globais aleatórias se necessário
    let globalTasks = [];
    if (userTasks.length < 4) {
      const neededTasks = 4 - userTasks.length;
      globalTasks = await Task.findAll({
        where: { user_id: null },
        order: Sequelize.literal('RANDOM()'),
        limit: neededTasks
      });
    }
    
    // Combinar as tasks do usuário com as tasks globais
    const allTasks = [...userTasks, ...globalTasks];
    console.log('Tasks encontradas:', allTasks);
    res.json(allTasks);
  } catch (error) {
    console.error('Erro ao buscar tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error });
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

    task.completed = true;
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
  } catch (error) {
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