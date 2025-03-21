import { Pto } from 'rtxtypes'
import { Table, Column, Model, PrimaryKey, Default, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript'
import { GroupEntity } from 'src/groups/entities/group.entity'

export interface UserAttributes {
  id: string
  groupId: string
  email: string
  firstName: string
  lastName: string
  role: Pto.Users.UserRoleType
  createdAt: Date
  updatedAt: Date
}

interface CreationAttributes extends Partial<UserAttributes> {
  groupId?: string
  email: string
  firstName: string
  lastName: string
  role: Pto.Users.UserRoleType
}

@Table({ tableName: 'Users' })
export class UserEntity extends Model<UserAttributes, CreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string

  @ForeignKey(() => GroupEntity)
  @Column({ type: DataType.UUID, allowNull: true })
  declare groupId: string

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string

  @Column({ type: DataType.STRING, allowNull: false })
  declare firstName: string

  @Column({ type: DataType.STRING, allowNull: false })
  declare lastName: string

  @Column({ type: DataType.STRING, allowNull: false })
  declare role: Pto.Users.UserRoleType

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date

  @BelongsTo(() => GroupEntity)
  declare group: GroupEntity
}
