import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('GroupEmailResults', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Groups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },

    info: {
      type: DataTypes.JSON,
      allowNull: true
    },

    error: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  })

  await queryInterface.addIndex('GroupEmailResults', ['groupId'])
  await queryInterface.addIndex('GroupEmailResults', ['email'])
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('GroupEmailResults')
}
