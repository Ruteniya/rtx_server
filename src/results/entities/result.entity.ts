import { Table, Column, Model, PrimaryKey, Default, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { GroupEntity } from 'src/groups/entities/group.entity'
import { NodeEntity } from 'src/nodes/entities/node.entity'

export interface ResultAttributes {
  id: string
  nodeId: string
  groupId: string
  earnedPoints: number
  createdAt: Date
  updatedAt: Date
}

interface CreationAttributes extends Partial<ResultAttributes> {
  nodeId: string
  groupId: string
  earnedPoints: number
}

@Table({ tableName: 'Results' })
export class ResultEntity extends Model<ResultAttributes, CreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string

  @ForeignKey(() => NodeEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare nodeId: string

  @ForeignKey(() => GroupEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare groupId: string

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare earnedPoints: number

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date

  @BelongsTo(() => NodeEntity, { foreignKey: 'nodeId' })
  declare node: NodeEntity

  @BelongsTo(() => GroupEntity, { foreignKey: 'groupId' })
  declare group: GroupEntity
}
