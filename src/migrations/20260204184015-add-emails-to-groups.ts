import { QueryInterface, DataTypes } from 'sequelize'

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.addColumn('Groups', 'emails', {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  })
}

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.removeColumn('Groups', 'emails')
}
