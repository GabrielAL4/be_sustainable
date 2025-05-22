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

export default Level; 