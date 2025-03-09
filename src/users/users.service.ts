import { Injectable, NotFoundException } from '@nestjs/common'
import { Pto } from '@rtx/types'
import { UserEntity } from './entities/user.entity'
import { InjectModel } from '@nestjs/sequelize'
import { GroupEntity } from 'src/groups/entities/group.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserEntity)
    private readonly userEntity: typeof UserEntity,

    @InjectModel(GroupEntity)
    private readonly groupEntity: typeof GroupEntity
  ) {}

  private mapEntityToPto(user: UserEntity): Pto.Users.User {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      groupId: user.groupId,

      group: user.group
    }
  }

  async create(createUserData: Pto.Users.CreateUser): Promise<Pto.Users.User> {
    const user = await this.userEntity.create({ ...createUserData, role: Pto.Users.UserRole.User })
    return this.mapEntityToPto(user)
  }

  async findAll(): Promise<Pto.Users.UserList> {
    const users = await this.userEntity.findAll()
    return { total: users.length, items: users.map(this.mapEntityToPto) }
  }

  async findOne(id: string): Promise<Pto.Users.User> {
    const user = await this.userEntity.findByPk(id, { include: GroupEntity })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return this.mapEntityToPto(user)
  }

  async findByEmail(email: string): Promise<Pto.Users.User | null> {
    const user = await this.userEntity.findOne({ where: { email } })
    if (!user) {
      return null
    }
    return this.mapEntityToPto(user)
  }

  async addToGroup(userId: string, groupId: string): Promise<Pto.Users.User> {
    const user = await this.userEntity.findByPk(userId, {
      include: {
        model: this.groupEntity,
        required: false
      }
    })

    if (!user) throw new NotFoundException('User not found')

    const group = await this.groupEntity.findByPk(groupId)
    if (!group) throw new NotFoundException('Group not found')

    await user.update({ groupId })

    return this.mapEntityToPto(user)
  }

  async remove(id: string): Promise<void> {
    const user = await this.userEntity.findByPk(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    await user.destroy()
  }
}
