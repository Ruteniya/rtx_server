import { Table, Column, Model, PrimaryKey, Default, DataType } from 'sequelize-typescript'

export interface GameAttributes {
  id: string
  name: string
  description?: string
  logo?: string
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

interface CreationAttributes extends Partial<GameAttributes> {
  name: string
  description?: string
  logo?: string
  startDate: Date
  endDate: Date
}

@Table({ tableName: 'Games' })
export class GameEntity extends Model<GameAttributes, CreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string

  @Column({ allowNull: false })
  declare name: string

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description?: string

  @Column({ allowNull: true })
  declare logo?: string

  @Column({ type: DataType.DATE, allowNull: false })
  declare startDate: Date

  @Column({ type: DataType.DATE, allowNull: false })
  declare endDate: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date
}
