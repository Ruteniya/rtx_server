import { Table, Column, Model, PrimaryKey, Default, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { CategoryEntity } from 'src/categories/entities/category.entity'

export interface GroupAttributes {
  id: string
  name: string
  numberOfParticipants: number
  categoryId: string
}

interface CreationAttributes extends Partial<GroupAttributes> {
  name: string
  numberOfParticipants: number
  categoryId: string
}

@Table({ tableName: 'Groups' })
export class GroupEntity extends Model<GroupAttributes, CreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string

  @Column({ allowNull: false })
  declare name: string

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare numberOfParticipants: number

  @ForeignKey(() => CategoryEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare categoryId: string

  @BelongsTo(() => CategoryEntity)
  category: CategoryEntity
}
