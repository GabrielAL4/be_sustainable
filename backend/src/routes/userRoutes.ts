import { Router } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Level from '../models/Level';
import Task from '../models/Task';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';
import UserTask from '../models/UserTask';
import { ValidationError, UniqueConstraintError } from 'sequelize';

const router = Router();

// Create admin user (development only)
router.post('/create-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ where: { email: 'admin@besustainable.com' } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    console.log('=== ADMIN CREATION DEBUG ===');
    const hashedPassword = await bcrypt.hash('1234', 10);
    console.log('Admin password hash:', hashedPassword);
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@besustainable.com',
      password: hashedPassword,
      level_id: 1,
      points: 0
    });

    console.log('Admin stored password:', admin.password);
    console.log('=== END ADMIN CREATION DEBUG ===');

    res.status(201).json({ message: 'Admin user created successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin user', error });
  }
});

// Register user
router.post('/register', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ 
      where: { email },
      transaction 
    });
    
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('=== REGISTER DEBUG ===');
    console.log('Raw password received:', password);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hash:', hashedPassword);

    // Create user within transaction
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      level_id: 1,
      points: 0,
      xp: 0
    }, { transaction });

    // Get 4 random tasks for the user
    const randomTasks = await Task.findAll({
      where: { user_id: null },
      order: sequelize.literal('RANDOM()'),
      limit: 4,
      transaction
    });

    // Create user tasks instead of copying tasks
    for (const task of randomTasks) {
      await UserTask.create({
        user_id: user.id,
        task_id: task.id,
        completed: false,
        progress: 0
      }, { transaction });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Remove password from response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      points: user.points,
      xp: user.xp,
      level_id: user.level_id
    };

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({ user: userResponse, token });
  } catch (error: unknown) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    
    console.error('Error in user registration:', error);
    
    // Verificar se é um erro de validação do Sequelize
    if (error instanceof ValidationError) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        errors: error.errors.map((e: ValidationError) => e.message)
      });
    }
    
    // Verificar se é um erro de chave única (email duplicado)
    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({ 
        message: 'Este email já está em uso'
      });
    }

    res.status(500).json({ 
      message: 'Erro ao criar usuário',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('\n=== LOGIN DEBUG ===');
    console.log('Login attempt for:', email);
    console.log('Raw password received:', password);

    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'email', 'password', 'name', 'points', 'xp', 'level_id']
    });
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'User not found' });
    }

    // Garantir que a senha não está vazia
    if (!password) {
      console.log('Password is empty');
      return res.status(400).json({ message: 'Password is required' });
    }

    console.log('Found user:', { id: user.id, email: user.email });
    console.log('Stored hashed password:', user.password);

    // Tentar diferentes métodos de comparação
    const directCompare = await bcrypt.compare(password, user.password);
    console.log('Direct bcrypt.compare result:', directCompare);

    // Se a comparação direta falhar, tentar outras abordagens
    let isValidPassword = directCompare;

    if (!isValidPassword) {
      // Tentar com um novo hash
      const newHash = await bcrypt.hash(password, 10);
      console.log('New hash of input password:', newHash);
      isValidPassword = await bcrypt.compare(password, newHash);
      console.log('Compare with new hash result:', isValidPassword);
    }

    if (!isValidPassword) {
      // Tentar comparar os hashes diretamente (não recomendado, mas para debug)
      console.log('Direct hash comparison:', user.password === await bcrypt.hash(password, 10));
    }

    console.log('Final validation result:', isValidPassword);
    console.log('=== END LOGIN DEBUG ===\n');
    
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Remove password from response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      points: user.points,
      xp: user.xp,
      level_id: user.level_id
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
});

// Update user points
router.put('/points/:id', async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.points = points;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user points', error });
  }
});

// Get user level info
router.get('/:userId/level', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentLevel = await Level.findByPk(user.level_id);
    if (!currentLevel) {
      return res.status(404).json({ message: 'Level not found' });
    }

    // Calcular progresso no nível atual
    const currentProgress = user.xp - currentLevel.min_points;
    const totalLevelPoints = currentLevel.max_points - currentLevel.min_points;
    const progressPercentage = Math.floor((currentProgress / totalLevelPoints) * 100);

    // Buscar próximo nível
    const nextLevel = await Level.findOne({
      where: {
        min_points: { [Op.gt]: currentLevel.max_points }
      },
      order: [['min_points', 'ASC']],
      limit: 1
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        points: user.points,
        xp: user.xp
      },
      level: {
        current: {
          id: currentLevel.id,
          name: currentLevel.name,
          min_points: currentLevel.min_points,
          max_points: currentLevel.max_points
        },
        progress: {
          current: currentProgress,
          total: totalLevelPoints,
          percentage: progressPercentage
        },
        next: nextLevel ? {
          id: nextLevel.id,
          name: nextLevel.name,
          min_points: nextLevel.min_points,
          max_points: nextLevel.max_points,
          points_needed: nextLevel.min_points - user.xp
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching user level info:', error);
    res.status(500).json({ message: 'Error fetching user level info', error });
  }
});

// Temporary debug route
router.get('/debug-passwords', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'password'],
      raw: true
    });

    console.log('=== PASSWORD DEBUG ===');
    for (const user of users) {
      console.log(`User ${user.email}:`);
      console.log('Stored password:', user.password);
      console.log('Can verify with 1234?', await bcrypt.compare('1234', user.password));
      console.log('---');
    }
    console.log('=== END PASSWORD DEBUG ===');

    res.json({ message: 'Debug info logged' });
  } catch (error) {
    res.status(500).json({ message: 'Error in debug route', error });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'xp'],
      include: [
        {
          model: Level,
          attributes: ['name'],
        }
      ]
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      xp: user.xp,
      level: (user as any).Level ? (user as any).Level.name : null
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error });
  }
});

export default router; 