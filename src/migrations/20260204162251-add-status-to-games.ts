import { QueryInterface, DataTypes } from 'sequelize'

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.addColumn('Games', 'status', {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Draft'
  })
}

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.removeColumn('Games', 'status')
}
