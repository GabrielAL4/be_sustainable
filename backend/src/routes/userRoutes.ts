import { Router } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Level from '../models/Level';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';

const router = Router();

// Create admin user (development only)
router.post('/create-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ where: { email: 'admin@besustainable.com' } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash('1234', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@besustainable.com',
      password: hashedPassword,
      level_id: 1,
      points: 0
    });

    res.status(201).json({ message: 'Admin user created successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin user', error });
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      level_id: 1
    });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'yes' : 'no');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation:', isValidPassword ? 'success' : 'failed');
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    console.log('Login successful for user:', email);
    res.json({ user, token });
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

export default router; 