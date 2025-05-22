import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';
import Level from './Level';

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public points!: number;
  public xp!: number;
  public level_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    xp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    level_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'Levels',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user: User) => {
        // Atualizar level_id baseado no XP atual
        const currentLevel = await Level.findOne({
          where: {
            min_points: { [sequelize.Op.lte]: user.xp },
            max_points: { [sequelize.Op.gt]: user.xp }
          }
        });
        if (currentLevel && currentLevel.id !== user.level_id) {
          user.level_id = currentLevel.id;
        }
      },
    },
  }
);

export default User; 