import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Task from './Task';

class UserWeeklyTask extends Model {
  public id!: number;
  public user_id!: number;
  public task_id!: number;
  public start_date!: Date;
  public end_date!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserWeeklyTask.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tasks',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserWeeklyTask',
    tableName: 'UserWeeklyTasks',
  }
);

UserWeeklyTask.belongsTo(User, { foreignKey: 'user_id' });
UserWeeklyTask.belongsTo(Task, { foreignKey: 'task_id' });

export default UserWeeklyTask; 