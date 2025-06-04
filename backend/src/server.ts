import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import levelRoutes from './routes/levelRoutes';
import { sequelize } from './config/database';
import Level, { createDefaultLevels } from './models/Level';
import { DataTypes } from 'sequelize';

const app = express();

// Configure CORS to accept requests from your React Native app
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.0.2.2:3000', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.method !== 'OPTIONS') {
    console.log('Body:', req.body);
  }
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

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Initialize database and server
const startServer = async () => {
  try {
    // Conectar ao banco de dados
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Criar tabela de níveis primeiro
    await sequelize.getQueryInterface().createTable('Levels', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      min_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      max_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      }
    }).catch(error => {
      if (error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeTableExistsError') {
        console.log('Levels table already exists');
      } else {
        throw error;
      }
    });

    // Criar níveis padrão
    await createDefaultLevels();

    // Sincronizar outros modelos
    await sequelize.sync();
    console.log('Database synced successfully');

    // Iniciar o servidor em todas as interfaces
    const server = app.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        console.log(`Server is running on http://${address.address}:${address.port}`);
      } else {
        console.log(`Server is running on port ${PORT}`);
      }
    });

    // Configurar timeouts mais longos
    server.timeout = 120000; // 2 minutos
    server.keepAliveTimeout = 120000;
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 