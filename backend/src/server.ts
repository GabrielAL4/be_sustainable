import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import levelRoutes from './routes/levelRoutes';
import { sequelize } from './config/database';
import { up as addXpColumn } from './migrations/20240522_add_xp_column';
import { up as addDefaultLevel } from './migrations/20240522_add_default_level';
import { up as addLevelForeignKey } from './migrations/20240522_add_level_foreign_key';
import { up as addInitialLevels } from './migrations/20240522_add_initial_levels';
import { up as updateLevels } from './migrations/20240522_update_levels';

const app = express();

// Configure CORS to accept requests from your React Native app
app.use(cors({
  origin: '*', // In production, you should specify your app's domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`[${new Date().toISOString()}] Response:`, body);
    return originalSend.call(this, body);
  };
  next();
});

// Mount routes with 'api' prefix
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/levels', levelRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

const PORT = process.env.PORT || 3000;

// Initialize database connection and run migrations
sequelize.authenticate()
  .then(async () => {
    console.log('Database connected successfully');
    
    // Run migrations in order
    try {
      await addXpColumn(sequelize.getQueryInterface());
      console.log('XP column migration completed');
    } catch (error: any) {
      console.log('XP column migration error (might already be applied):', error.message);
    }

    try {
      await addDefaultLevel(sequelize.getQueryInterface());
      console.log('Default level migration completed');
    } catch (error: any) {
      console.log('Default level migration error (might already be applied):', error.message);
    }

    try {
      await addLevelForeignKey(sequelize.getQueryInterface());
      console.log('Level foreign key migration completed');
    } catch (error: any) {
      console.log('Level foreign key migration error (might already be applied):', error.message);
    }

    try {
      await updateLevels(sequelize.getQueryInterface());
      console.log('Update levels migration completed');
    } catch (error: any) {
      console.log('Update levels migration error:', error.message);
    }

    // Sync models without altering existing columns
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database synced successfully');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error initializing database:', error);
    process.exit(1);
  }); 