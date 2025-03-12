import { Pto } from '@rtx/types'
import { Table, Column, Model, PrimaryKey, Default, DataType, Unique } from 'sequelize-typescript'

export interface NodeAttributes {
  id: string
  name: string
  answerType: Pto.Nodes.AnswerType
  question: string
  questionImage?: string
  adminDescription?: string
  correctAnswer?: string
  points: number
  comment?: string
  createdAt: Date
  updatedAt: Date
}

interface CreationAttributes extends Partial<NodeAttributes> {
  name: string
  answerType: Pto.Nodes.AnswerType
  question: string
  points: number
}

@Table({ tableName: 'Nodes' })
export class NodeEntity extends Model<NodeAttributes, CreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string

  @Unique
  @Column({ allowNull: false })
  declare name: string

  @Column({ allowNull: false })
  declare answerType: Pto.Nodes.AnswerType

  @Column({ allowNull: false })
  declare question: string

  @Column({ allowNull: true })
  declare questionImage?: string

  @Column({ allowNull: true })
  declare adminDescription?: string

  @Column({ allowNull: true })
  declare correctAnswer?: string

  @Column({ allowNull: false })
  declare points: number

  @Column({ allowNull: true })
  declare comment?: string

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date
}
