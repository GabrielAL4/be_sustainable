import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('Tasks', 'type', {
    type: DataTypes.ENUM('daily', 'weekly'),
    defaultValue: 'daily',
    allowNull: false,
  });

  await queryInterface.addColumn('Tasks', 'required_completions', {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  });

  await queryInterface.addColumn('Tasks', 'current_completions', {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  });

  await queryInterface.addColumn('UserTasks', 'progress', {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('Tasks', 'current_completions');
  await queryInterface.removeColumn('Tasks', 'required_completions');
  await queryInterface.removeColumn('Tasks', 'type');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_Tasks_type;');
  await queryInterface.removeColumn('UserTasks', 'progress');
} 