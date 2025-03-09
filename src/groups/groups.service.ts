import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { GroupEntity } from './entities/group.entity'
import { Pto } from '@rtx/types'
import { CategoryEntity } from 'src/categories/entities/category.entity'

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

  async findOne(id: string): Promise<Pto.Groups.Group> {
    const group = await this.groupRepo.findByPk(id, { include: CategoryEntity })
    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found`)
    }
    return this.mapEntityToPto(group)
  }

  async update(id: string, updateGroupDto: Pto.Groups.UpdateGroup): Promise<Pto.Groups.Group> {
    const group = await this.groupRepo.findByPk(id)
    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found`)
    }
    await group.update(updateGroupDto)
    return this.mapEntityToPto(group)
  }

  async remove(id: string): Promise<void> {
    const group = await this.groupRepo.findByPk(id)
    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found`)
    }
    await group.destroy()
  }
}
