import { Router } from 'express';
import { Op, Sequelize } from 'sequelize';
import Task from '../models/Task';
import User from '../models/User';
import Level from '../models/Level';
import UserTask from '../models/UserTask';

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
    const userId = parseInt(req.params.userId);
    // Buscar IDs das tarefas já concluídas pelo usuário
    const completedUserTasks = await UserTask.findAll({
      where: { user_id: userId, completed: true },
      attributes: ['task_id']
    });
    const completedTaskIds = completedUserTasks.map(ut => ut.task_id);
    
    // Buscar tarefas diárias não concluídas
    const dailyTasks = await Task.findAll({
      where: {
        type: 'daily',
        id: { [Op.notIn]: completedTaskIds }
      },
      order: Sequelize.literal('RANDOM()'),
      limit: 4
    });

    // Buscar tarefas semanais não concluídas
    const weeklyTasks = await Task.findAll({
      where: {
        type: 'weekly',
        id: { [Op.notIn]: completedTaskIds }
      },
      order: Sequelize.literal('RANDOM()')
    });

    const tasks = [...dailyTasks, ...weeklyTasks];
    res.json(tasks);
  } catch (error: any) {
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
    const taskId = parseInt(req.params.id);
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Verifica se já existe UserTask
    let userTask = await UserTask.findOne({ where: { user_id, task_id: taskId } });
    if (userTask && userTask.completed) {
      return res.status(400).json({ message: 'Task already completed by this user' });
    }
    if (!userTask) {
      userTask = await UserTask.create({
        user_id,
        task_id: taskId,
        completed: true,
        completedAt: new Date()
      });
    } else {
      userTask.completed = true;
      userTask.completedAt = new Date();
      await userTask.save();
    }
    // Dar pontos ao usuário
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