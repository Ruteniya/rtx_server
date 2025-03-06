import { QueryInterface, DataTypes } from 'sequelize'

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.changeColumn('Games', 'logo', {
    type: DataTypes.TEXT, // Змінюємо тип на TEXT для підтримки base64
    allowNull: true
  })
}

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.changeColumn('Games', 'logo', {
    type: DataTypes.STRING,
    allowNull: true
  })
}
