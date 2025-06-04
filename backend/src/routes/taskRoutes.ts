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
    const { title, description, points, type, required_completions } = req.body;
    
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

    // Validate task type and required completions
    if (type === 'weekly' && (!required_completions || required_completions < 1)) {
      return res.status(400).json({
        message: 'Invalid required completions',
        error: {
          details: {
            required_completions: 'Required completions must be a positive number for weekly tasks'
          }
        }
      });
    }

    console.log('Creating task with data:', { title, description, points, type, required_completions }); // Debug log
    
    const task = await Task.create({
      title,
      description,
      points,
      type: type || 'daily',
      required_completions: type === 'weekly' ? required_completions : 1,
      current_completions: 0,
      completed: false
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
    
    // Calcular a data limite de 24 horas atrás para tarefas diárias
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // Calcular a data limite de 7 dias atrás para tarefas semanais
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Buscar tarefas diárias
    const dailyTasks = await Task.findAll({
      where: {
        type: 'daily',
        [Op.or]: [
          { completed: false },
          {
            completed: true,
            user_id: req.params.userId,
            updatedAt: { [Op.gte]: oneDayAgo }
          }
        ]
      },
      order: [['completed', 'ASC'], Sequelize.literal('RANDOM()')],
      limit: 4
    });

    // Buscar tarefas semanais
    const weeklyTasks = await Task.findAll({
      where: {
        type: 'weekly',
        [Op.or]: [
          { completed: false },
          {
            completed: true,
            user_id: req.params.userId,
            updatedAt: { [Op.gte]: oneWeekAgo }
          }
        ]
      },
      order: [['completed', 'ASC'], Sequelize.literal('RANDOM()')],
      limit: 1
    });

    // Combinar as tarefas
    const tasks = [...dailyTasks, ...weeklyTasks];
    console.log('Tasks encontradas:', tasks.length);
    
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

    const { user_id, current_completions } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (task.type === 'weekly') {
      // Para tarefas semanais, atualizamos o contador
      const newCompletions = current_completions || (task.current_completions + 1);
      task.current_completions = newCompletions;
      
      // Verificamos se atingiu o objetivo
      if (newCompletions >= task.required_completions) {
        task.completed = true;
        // Só damos os pontos quando completa totalmente
        user.points += task.points;
        user.xp += task.points;
        await user.save();
      }
    } else {
      // Para tarefas diárias, comportamento normal
      if (task.completed) {
        return res.status(400).json({ message: 'Task already completed' });
      }
      task.completed = true;
      user.points += task.points;
      user.xp += task.points;
      await user.save();
    }

    task.user_id = user_id;
    await task.save();

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