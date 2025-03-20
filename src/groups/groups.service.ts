import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { GroupEntity } from './entities/group.entity'
import { Pto } from '@rtx/types'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { UserEntity } from 'src/users/entities/user.entity'

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(GroupEntity)
    private readonly groupRepo: typeof GroupEntity
  ) {}

  private mapEntityToPto(group: GroupEntity): Pto.Groups.Group {
    return {
      id: group.id,
      name: group.name,
      numberOfParticipants: group.numberOfParticipants,
      categoryId: group.categoryId,
      category: group.category
    }
  }

  private mapEntityToPopulatedPto(group: GroupEntity): Pto.Groups.PopulatedGroup {
    const groupPto = this.mapEntityToPto(group)
    return {
      ...groupPto,
      category: group.category,
      users: group.users
    }
  }

  async create(createGroupDto: Pto.Groups.CreateGroup): Promise<Pto.Groups.Group> {
    const group = await this.groupRepo.create(createGroupDto)
    return this.mapEntityToPto(group)
  }

  async findAll(): Promise<Pto.Groups.GroupList> {
    const groups = await this.groupRepo.findAll({
      include: [
        {
          model: CategoryEntity,
          as: 'category'
        }
      ]
    })
    return {
      total: groups.length,
      items: groups.map(this.mapEntityToPto)
    }
  }

  async findPopulatedOne(id: string): Promise<Pto.Groups.Group> {
    const group = await this.groupRepo.findByPk(id, { include: [CategoryEntity, UserEntity] })
    if (!group) {
      throw new NotFoundException(Pto.Errors.Messages.GROUP_NOT_FOUND)
    }
    return this.mapEntityToPopulatedPto(group)
  }

  async findOne(id: string): Promise<Pto.Groups.Group> {
    const group = await this.groupRepo.findByPk(id, { include: CategoryEntity })
    if (!group) {
      throw new NotFoundException(Pto.Errors.Messages.GROUP_NOT_FOUND)
    }
    return this.mapEntityToPto(group)
  }

  async update(id: string, updateGroupDto: Pto.Groups.UpdateGroup): Promise<void> {
    const group = await this.groupRepo.findByPk(id)
    if (!group) {
      throw new NotFoundException(Pto.Errors.Messages.GROUP_NOT_FOUND)
    }
    await group.update(updateGroupDto)
  }

  async remove(id: string): Promise<void> {
    const group = await this.groupRepo.findByPk(id)
    if (!group) {
      throw new NotFoundException(Pto.Errors.Messages.GROUP_NOT_FOUND)
    }
    await group.destroy()
  }

  //seed
  async findByName(name: string): Promise<Pto.Groups.Group | null> {
    const group = await this.groupRepo.findOne({ where: { name } })
    return group ? this.mapEntityToPto(group) : null
  }
}
