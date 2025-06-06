import { Router } from 'express';
import { Op, Sequelize } from 'sequelize';
import Task from '../models/Task';
import User from '../models/User';
import Level from '../models/Level';
import UserTask from '../models/UserTask';
import UserWeeklyTask from '../models/UserWeeklyTask';

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
  } catch (error: any) {
    console.error('Error creating task:', error); // Debug log
    res.status(500).json({
      message: 'Error creating task',
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

// Get all tasks for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    // Buscar UserTasks do usuário
    const userTasks = await UserTask.findAll({
      where: { user_id: userId },
      attributes: ['task_id', 'completed', 'progress']
    });
    const userTaskMap: { [taskId: number]: any } = {};
    for (const ut of userTasks) {
      userTaskMap[ut.task_id] = ut;
    }
    // Buscar tarefas diárias não concluídas
    const completedDailyTaskIds = userTasks
      .filter(ut => ut.completed)
      .map(ut => ut.task_id);
    const dailyTasks = await Task.findAll({
      where: {
        type: 'daily',
        id: { [Op.notIn]: completedDailyTaskIds }
      },
      order: Sequelize.literal('RANDOM()'),
      limit: 4
    });
    // LOG: Listar todas as tarefas semanais cadastradas
    const allWeeklyTasks = await Task.findAll({ where: { type: 'weekly' } });
    console.log('DEBUG - Todas as tarefas semanais:', allWeeklyTasks.map(t => t.toJSON()));
    // LOG: Listar todos os UserWeeklyTask do usuário
    const allUserWeeklyTasks = await UserWeeklyTask.findAll({ where: { user_id: userId } });
    console.log('DEBUG - Todos os UserWeeklyTask do usuário:', allUserWeeklyTasks.map(uwt => uwt.toJSON()));
    // Buscar apenas UMA tarefa semanal ativa para o usuário (fixa por 7 dias)
    const now = new Date();
    let userWeeklyTask = await UserWeeklyTask.findOne({
      where: {
        user_id: userId,
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now }
      }
    });
    console.log('DEBUG - UserWeeklyTask ativa encontrada:', userWeeklyTask ? userWeeklyTask.toJSON() : null);
    let weeklyTask = null;
    if (!userWeeklyTask) {
      // Só sortear uma nova semanal se não houver nenhuma ativa
      if (allWeeklyTasks.length > 0) {
        const randomIndex = Math.floor(Math.random() * allWeeklyTasks.length);
        const task = allWeeklyTasks[randomIndex];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 7);
        userWeeklyTask = await UserWeeklyTask.create({
          user_id: userId,
          task_id: task.id,
          start_date: startDate,
          end_date: endDate
        });
        weeklyTask = task;
      }
    } else {
      weeklyTask = await Task.findByPk(userWeeklyTask.task_id);
    }
    // Montar objeto da tarefa semanal com progresso
    let weeklyTasks: any[] = [];
    if (weeklyTask) {
      const ut = userTaskMap[weeklyTask.id];
      weeklyTasks = [{
        ...weeklyTask.toJSON(),
        progress: ut ? ut.progress : 0,
        completed: ut ? ut.completed : false,
        required_completions: weeklyTask.required_completions
      }];
    }
    console.log('DEBUG - dailyTasks:', dailyTasks);
    console.log('DEBUG - weeklyTasks:', weeklyTasks);
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
  } catch (error: any) {
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
    let userTask = await UserTask.findOne({ where: { user_id, task_id: taskId } });
    if (task.type === 'weekly') {
      // Tarefa semanal: progresso incremental
      const required = task.required_completions || 1;
      if (!userTask) {
        userTask = await UserTask.create({
          user_id,
          task_id: taskId,
          progress: 1,
          completed: required === 1,
          completedAt: required === 1 ? new Date() : null
        });
      } else {
        if (userTask.completed) {
          return res.status(400).json({ message: 'Task already completed by this user' });
        }
        userTask.progress += 1;
        if (userTask.progress >= required) {
          userTask.completed = true;
          userTask.completedAt = new Date();
        } else {
          userTask.completed = false;
        }
        await userTask.save();
      }
      // Só dar pontos quando completar a tarefa semanal
      if (userTask.completed && userTask.progress === required) {
        user.points += task.points;
        user.xp += task.points;
        await user.save();
      }
    } else {
      // Tarefa diária: comportamento padrão
      if (userTask && userTask.completed) {
        return res.status(400).json({ message: 'Task already completed by this user' });
      }
      if (!userTask) {
        userTask = await UserTask.create({
          user_id,
          task_id: taskId,
          completed: true,
          completedAt: new Date(),
          progress: 1
        });
      } else {
        userTask.completed = true;
        userTask.completedAt = new Date();
        userTask.progress = 1;
        await userTask.save();
      }
      user.points += task.points;
      user.xp += task.points;
      await user.save();
    }
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
      },
      userTask
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
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
});

export default router; 