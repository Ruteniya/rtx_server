import { QueryInterface, DataTypes } from 'sequelize'

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.addColumn('Games', 'status', {
    type: DataTypes.STRING(50),
    allowNull: true
  });

  await queryInterface.sequelize.query(
    `UPDATE "Games" SET "status" = 'Draft' WHERE "status" IS NULL;`
  );

  await queryInterface.changeColumn('Games', 'status', {
    type: DataTypes.STRING(50),
    allowNull: false
  });
}

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.removeColumn('Games', 'status');
}
