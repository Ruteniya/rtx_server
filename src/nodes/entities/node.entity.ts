import { Pto } from 'rtxtypes'
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  Unique,
  HasMany,
  BelongsToMany
} from 'sequelize-typescript'
import { AnswerEntity } from './answer.entity'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { NodeCategoryEntity } from './node-category.entity'

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
  color?: string
  createdAt: Date
  updatedAt: Date
}

interface CreationAttributes extends Partial<NodeAttributes> {
  name: string
  answerType: Pto.Nodes.AnswerType
  question: string
  adminDescription?: string
  questionImage?: string
  correctAnswer?: string
  points: number
  color?: string
  comment?: string
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

  @Column({ allowNull: true })
  declare color?: string

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date

  @HasMany(() => AnswerEntity)
  declare answers: AnswerEntity[]

  @BelongsToMany(() => CategoryEntity, () => NodeCategoryEntity)
  declare categories: CategoryEntity[]

  @HasMany(() => NodeCategoryEntity)
  declare nodeCategories: NodeCategoryEntity[]
}
