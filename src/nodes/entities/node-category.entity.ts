import { Table, Column, Model, PrimaryKey, Default, DataType, ForeignKey } from 'sequelize-typescript'
import { NodeEntity } from './node.entity'
import { CategoryEntity } from 'src/categories/entities/category.entity'

export interface NodeCategoryAttributes {
  id: string
  nodeId: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

interface CreationAttributes extends Partial<NodeCategoryAttributes> {
  nodeId: string
  categoryId: string
}

@Table({ tableName: 'NodeCategories' })
export class NodeCategoryEntity extends Model<NodeCategoryAttributes, CreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string

  @ForeignKey(() => NodeEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare nodeId: string

  @ForeignKey(() => CategoryEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare categoryId: string

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date
}
