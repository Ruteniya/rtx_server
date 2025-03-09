import { QueryInterface, DataTypes } from 'sequelize'

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.changeColumn('Games', 'logo', {
    type: DataTypes.TEXT,
    allowNull: true
  })
  await queryInterface.changeColumn('Games', 'description', {
    type: DataTypes.TEXT,
    allowNull: true
  })
}

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.changeColumn('Games', 'logo', {
    type: DataTypes.STRING,
    allowNull: true
  })
  await queryInterface.changeColumn('Games', 'description', {
    type: DataTypes.STRING,
    allowNull: true
  })
}
