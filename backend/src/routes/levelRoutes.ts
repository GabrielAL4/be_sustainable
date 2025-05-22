import { Router } from 'express';
import Level from '../models/Level';
import { Op } from 'sequelize';

const router = Router();

// Create level
router.post('/', async (req, res) => {
  try {
    const { name, min_points, max_points } = req.body;
    
    const level = await Level.create({
      name,
      min_points,
      max_points
    });

    res.status(201).json(level);
  } catch (error) {
    res.status(500).json({ message: 'Error creating level', error });
  }
});

// Get all levels
router.get('/', async (req, res) => {
  try {
    const levels = await Level.findAll({
      order: [['min_points', 'ASC']]
    });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching levels', error });
  }
});

// Get level by points
router.get('/by-points/:points', async (req, res) => {
  try {
    const points = parseInt(req.params.points);
    const level = await Level.findOne({
      where: {
        min_points: { [Op.lte]: points },
        max_points: { [Op.gt]: points }
      }
    });

    if (!level) {
      return res.status(404).json({ message: 'Level not found for given points' });
    }

    res.json(level);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching level', error });
  }
});

// Update level
router.put('/:id', async (req, res) => {
  try {
    const { name, min_points, max_points } = req.body;
    const level = await Level.findByPk(req.params.id);
    
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    level.name = name;
    level.min_points = min_points;
    level.max_points = max_points;
    await level.save();

    res.json(level);
  } catch (error) {
    res.status(500).json({ message: 'Error updating level', error });
  }
});

export default router; 