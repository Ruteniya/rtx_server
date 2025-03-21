import { QueryInterface, DataTypes } from 'sequelize'

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.createTable('Nodes', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    answerType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    questionImage: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    adminDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    correctAnswer: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
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
  await queryInterface.dropTable('Nodes')
}
