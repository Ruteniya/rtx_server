import { Table, Column, Model, PrimaryKey, Default, DataType, BelongsToMany, HasMany } from 'sequelize-typescript'
import { GroupEntity } from 'src/groups/entities/group.entity'

export interface CategoryAttributes {
  id: string
  name: string
  description: string
  color: string
  createdAt: Date
  updatedAt: Date
}

interface CreationAttributes extends Partial<CategoryAttributes> {
  name: string
  description?: string
  color?: string
}

@Table({ tableName: 'Categories' })
export class CategoryEntity extends Model<CategoryAttributes, CreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string

  @Column({ allowNull: false })
  declare name: string

  @Column({ type: DataType.TEXT, allowNull: false })
  declare description: string

  @Column({ type: DataType.STRING, allowNull: true })
  declare color: string

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date

  @HasMany(() => GroupEntity, { foreignKey: 'categoryId', as: 'groups' })
  declare groups: GroupEntity[]
}
