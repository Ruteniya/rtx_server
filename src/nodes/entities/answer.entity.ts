import { Table, Column, Model, PrimaryKey, Default, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript'
import { GroupEntity } from 'src/groups/entities/group.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { NodeEntity } from './node.entity'

export interface AnswerAttributes {
  id: string
  userId: string
  groupId: string
  nodeId: string
  answerValue: string
  userComment?: string
  processed: boolean
  correct: boolean
  createdAt: Date
  updatedAt: Date
}

interface CreationAttributes extends Partial<AnswerAttributes> {
  userId: string
  groupId: string
  nodeId: string
  answerValue: string
}

@Table({ tableName: 'Answers' })
export class AnswerEntity extends Model<AnswerAttributes, CreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string

  @ForeignKey(() => UserEntity)
  @Column({ allowNull: false })
  declare userId: string

  @ForeignKey(() => GroupEntity)
  @Column({ allowNull: false })
  declare groupId: string

  @ForeignKey(() => NodeEntity)
  @Column({ allowNull: false })
  declare nodeId: string

  @Column({ allowNull: false })
  declare answerValue: string

  @Column({ allowNull: true })
  declare userComment?: string

  @Index
  @Column({ allowNull: false, defaultValue: false })
  declare processed: boolean

  @Column({ allowNull: false, defaultValue: false })
  declare correct: boolean

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date

  @BelongsTo(() => UserEntity)
  declare user: UserEntity

  @BelongsTo(() => GroupEntity)
  declare group: GroupEntity

  @BelongsTo(() => NodeEntity)
  declare node: NodeEntity
}
