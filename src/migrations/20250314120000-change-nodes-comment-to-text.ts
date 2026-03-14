import { QueryInterface, DataTypes } from 'sequelize'

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.changeColumn('Nodes', 'comment', {
    type: DataTypes.TEXT('long'),
    allowNull: true
  })
}

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.changeColumn('Nodes', 'comment', {
    type: DataTypes.STRING(255),
    allowNull: true
  })
}
