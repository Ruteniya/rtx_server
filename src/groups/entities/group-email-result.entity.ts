import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript'
import { GroupEntity } from 'src/groups/entities/group.entity'

export interface GroupEmailResultAttributes {
  id: string
  groupId: string
  email: string
  success: boolean
  info?: any
  error?: string
  createdAt: Date
}

interface CreationAttributes extends Partial<GroupEmailResultAttributes> {
  groupId: string
  email: string
  success: boolean
}

@Table({ tableName: 'GroupEmailResults' })
export class GroupEmailResultEntity extends Model<GroupEmailResultAttributes, CreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string

  @ForeignKey(() => GroupEntity)
  @Column({ type: DataType.UUID, allowNull: false })
  declare groupId: string

  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare success: boolean

  @Column({ type: DataType.JSON, allowNull: true })
  declare info?: any

  @Column({ type: DataType.TEXT, allowNull: true })
  declare error?: string

  @CreatedAt
  declare createdAt: Date

  @UpdatedAt
  declare updatedAt: Date

  @BelongsTo(() => GroupEntity)
  declare group: GroupEntity
}
