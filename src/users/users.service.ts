import { Injectable, NotFoundException } from '@nestjs/common'
import { Pto } from 'rtxtypes'
import { UserAttributes, UserEntity } from './entities/user.entity'
import { InjectModel } from '@nestjs/sequelize'
import { GroupEntity } from 'src/groups/entities/group.entity'
import { Op, Sequelize, WhereOptions } from 'sequelize'
import { first } from 'rxjs'
import { CategoryEntity } from 'src/categories/entities/category.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserEntity)
    private readonly userRepo: typeof UserEntity,

    @InjectModel(GroupEntity)
    private readonly groupRepo: typeof GroupEntity
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

  private mapEntityToPopulatedPto(user: UserEntity): Pto.Users.PopulatedUser {
    const pto = this.mapEntityToPto(user)
    return {
      ...pto,
      group: user.group
    }
  }

  async create(createUserData: Pto.Users.CreateUser): Promise<Pto.Users.User> {
    const user = await this.userRepo.create({ ...createUserData, role: Pto.Users.UserRole.User })
    return this.mapEntityToPto(user)
  }

  async findOne(id: string): Promise<Pto.Users.PopulatedUser> {
    const user = await this.userRepo.findByPk(id, {
      include: {
        model: GroupEntity,
        include: [
          {
            model: CategoryEntity,
            required: true
          }
        ],
        required: false
      }
    })
    if (!user) {
      throw new NotFoundException(Pto.Errors.Messages.USER_NOT_FOUND)
    }
    return this.mapEntityToPopulatedPto(user)
  }

  async findByEmail(email: string): Promise<Pto.Users.User | null> {
    const user = await this.userRepo.findOne({ where: { email } })
    if (!user) {
      return null
    }
    return this.mapEntityToPto(user)
  }

  async addToGroup(userId: string, groupId: string): Promise<Pto.Users.User> {
    const user = await this.userRepo.findByPk(userId, {
      include: {
        model: this.groupRepo,
        required: false
      }
    })

    if (!user) throw new NotFoundException(Pto.Errors.Messages.USER_NOT_FOUND)

    const group = await this.groupRepo.findByPk(groupId)
    if (!group) throw new NotFoundException(Pto.Errors.Messages.GROUP_NOT_FOUND)

    await user.update({ groupId })

    return this.mapEntityToPto(user)
  }

  async changeUserRole(userId: string, newRole: Pto.Users.UserRoleType): Promise<Pto.Users.User> {
    const user = await this.userRepo.findByPk(userId)
    if (!user) {
      throw new NotFoundException(Pto.Errors.Messages.USER_NOT_FOUND)
    }

    user.role = newRole
    await user.save()

    return this.mapEntityToPto(user)
  }

  async getAll(query: Pto.Users.UsersListQuery): Promise<Pto.Users.UserList> {
    const { searchText, page = 1, size = 10 } = query
    const where: WhereOptions<UserAttributes> = {}
    if (searchText) {
      const lowerSearch = searchText.toLowerCase()

      where[Op.or] = [
        Sequelize.literal(`LOWER(email) LIKE LOWER('%${lowerSearch}%')`),
        Sequelize.literal(`LOWER(firstName) LIKE LOWER('%${lowerSearch}%')`),
        Sequelize.literal(`LOWER(lastName) LIKE LOWER('%${lowerSearch}%')`),
        Sequelize.literal(`LOWER(\`group\`.name) LIKE LOWER('%${lowerSearch}%')`)
      ]
    }

    const result = await this.userRepo.findAndCountAll({
      distinct: true,
      col: 'id',
      where,
      offset: (page - 1) * size,
      limit: Number(size),
      order: [['updatedAt', 'DESC']],
      include: [GroupEntity]
    })

    return { total: result.count, items: result.rows.map((answer) => this.mapEntityToPopulatedPto(answer)) }
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepo.findByPk(id)
    if (!user) {
      throw new NotFoundException(Pto.Errors.Messages.USER_NOT_FOUND)
    }
    await user.destroy()
  }

  //seed
  async createSystemAdmin(createUserData: Pto.Users.CreateUser): Promise<Pto.Users.User> {
    const user = await this.userRepo.create({ ...createUserData, role: Pto.Users.UserRole.SystemAdmin })
    return this.mapEntityToPto(user)
  }
}
