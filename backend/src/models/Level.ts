import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

class Level extends Model {
  public id!: number;
  public name!: string;
  public min_points!: number;
  public max_points!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Level.init(
  {
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
  },
  {
    sequelize,
    modelName: 'Level',
  }
);

export const createDefaultLevels = async () => {
  try {
    const count = await Level.count();
    if (count === 0) {
      await Level.bulkCreate([
        { name: 'Iniciante', min_points: 0, max_points: 100 },
        { name: 'Intermediário', min_points: 101, max_points: 300 },
        { name: 'Avançado', min_points: 301, max_points: 600 },
        { name: 'Expert', min_points: 601, max_points: 1000 }
      ]);
      console.log('Default levels created successfully');
    }
  } catch (error) {
    console.error('Error creating default levels:', error);
  }
};

export default Level; 