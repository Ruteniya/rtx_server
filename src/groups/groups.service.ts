import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { GroupAttributes, GroupEntity } from './entities/group.entity'
import { Pto } from 'rtxtypes'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { Op, WhereOptions } from 'sequelize'
import { S3Service } from 'src/s3/s3.service'

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(GroupEntity)
    private readonly groupRepo: typeof GroupEntity,

    @InjectModel(CategoryEntity) private readonly categoryRepo: typeof CategoryEntity,
    
    private readonly s3Service: S3Service
  ) {}

  private mapEntityToPto(group: GroupEntity): Pto.Groups.Group {
    return {
      id: group.id,
      name: group.name,
      numberOfParticipants: group.numberOfParticipants,
      categoryId: group.categoryId,
      category: group.category,
      emails: group.emails
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

  private escapeCsvValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return ''
    }
    const stringValue = String(value)
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  async create(createGroupDto: Pto.Groups.CreateGroup): Promise<Pto.Groups.Group> {
    const group = await this.groupRepo.create(createGroupDto)
    return this.mapEntityToPto(group)
  }

  async bulkCreateFromCsv(groups: {
    name: string
    categoryName: string
    numberOfParticipants: number
    emails: string[]
  }[]) {
    const categories = await this.categoryRepo.findAll()
    const categoryMap = new Map(categories.map((c) => [c.name, c.id]))

    const createdGroups: GroupEntity[] = []

    for (const group of groups) {
      const categoryId = categoryMap.get(group.categoryName)
      if (!categoryId) {
        throw new BadRequestException(`Категорія "${group.categoryName}" не знайдена`)
      }

      const created = await this.groupRepo.create({
        name: group.name,
        categoryId,
        numberOfParticipants: group.numberOfParticipants,
        emails: group.emails
      })

      createdGroups.push(created)
    }

    return createdGroups
  }

  async findAll(query: Pto.Groups.GroupsListQuery): Promise<Pto.Groups.GroupList> {
    const { searchText, categoryIds, page = 1, size = 10 } = query

    const offset = (page - 1) * size
    const where: WhereOptions<GroupAttributes> = {}
    if (searchText) {
      const parsedParticipants = Number(searchText)
      const searchFilters: WhereOptions<GroupAttributes>[] = [
        { name: { [Op.like]: `%${searchText}%` } }
      ]
      if (!Number.isNaN(parsedParticipants)) {
        searchFilters.push({ numberOfParticipants: parsedParticipants })
      }
      where[Op.or] = searchFilters
    }

    if (categoryIds) {
      const normalizedCategoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds]
      if (normalizedCategoryIds.length) {
        where.categoryId = { [Op.in]: normalizedCategoryIds }
      }
    }

    const groups = await this.groupRepo.findAndCountAll({
        offset,
        limit: size,    
        order: [['name', 'ASC']],
        where,
        include: [
          {
          model: CategoryEntity,
          as: 'category'
        }
      ]
    })
    return {
      total: groups.count,
      items: groups.rows.map(this.mapEntityToPto)
    }
  }

  async findPopulatedOne(id: string): Promise<Pto.Groups.PopulatedGroup> {
    const group = await this.groupRepo.findByPk(id, { include: [CategoryEntity, UserEntity] })
    if (!group) {
      throw new NotFoundException(Pto.Errors.Messages.GROUP_NOT_FOUND)
    }
    return this.mapEntityToPopulatedPto(group)
  }

  async exportGroupsCsv(): Promise<Pto.App.File> {
    const groups = await this.groupRepo.findAll({
      order: [['name', 'ASC']],
      include: [{ model: CategoryEntity, as: 'category' }]
    })

    const header = ['ID', 'Назва команди', 'Кількість учасників', 'Категорія']
    const rows = groups.map((group) => [
      this.escapeCsvValue(group.id),
      this.escapeCsvValue(group.name),
      this.escapeCsvValue(group.numberOfParticipants),
      this.escapeCsvValue(group.category?.name ?? '')
    ])

    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n')
    const csvWithBom = `\uFEFF${csvContent}`
    const key = await this.s3Service.uploadBufferWithRandomKey(
      Buffer.from(csvWithBom, 'utf8'),
      'exports',
      'csv',
      'text/csv; charset=utf-8',
      'groups'
    )
    const url = await this.s3Service.getSignedUrl(key)

    return { url }
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

    console.log(updateGroupDto)

    await group.update({
      ...updateGroupDto,
      emails: Array.isArray(updateGroupDto.emails)
        ? updateGroupDto.emails
        : group.emails
    })
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
