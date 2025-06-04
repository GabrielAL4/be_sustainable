import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

class Task extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public points!: number;
  public completed!: boolean;
  public user_id!: number | null;
  public type!: 'daily' | 'weekly';
  public required_completions!: number;
  public current_completions!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('daily', 'weekly'),
      defaultValue: 'daily',
      allowNull: false,
    },
    required_completions: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    current_completions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'Tasks',
  }
);

Task.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'CompletedBy'
});

export default Task; 