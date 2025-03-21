import { QueryInterface, DataTypes } from 'sequelize'

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.createTable('Answers', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    nodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Nodes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    answerValue: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    userComment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    processed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  })
}

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable('Answers')
}
