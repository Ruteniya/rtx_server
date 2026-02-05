import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { GroupEntity } from './entities/group.entity'
import { Pto } from 'rtxtypes'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { UserEntity } from 'src/users/entities/user.entity'
import { S3Service } from 'src/s3/s3.service'
import { EmailService } from 'src/email/email.service'
import { GamesService } from 'src/games/games.service'
import { GroupEmailResultEntity } from './entities/group-email-result.entity'
import { Sequelize } from 'sequelize-typescript'
import { Op, QueryTypes } from 'sequelize'

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(GroupEntity)
    private readonly groupRepo: typeof GroupEntity,

    @InjectModel(CategoryEntity) private readonly categoryRepo: typeof CategoryEntity,

    @Inject(EmailService)
    private readonly emailService: EmailService,

    @Inject(GamesService)
    private readonly gamesService: GamesService,

    @InjectModel(GroupEmailResultEntity)
    private readonly groupEmailResultRepo: typeof GroupEmailResultEntity,

    private readonly s3Service: S3Service,

    private readonly sequelize: Sequelize
  ) {}

  private mapEntityToPto(group: GroupEntity): Pto.Groups.Group & { emailResults?: GroupEmailResultEntity[] } {
    return {
      id: group.id,
      name: group.name,
      numberOfParticipants: group.numberOfParticipants,
      categoryId: group.categoryId,
      category: group.category,
      emails: group.emails,
      ...(group.emailResults ? { emailResults: group.emailResults } : {})
    }
  }

  private mapEntityToPtoWithEmailResults(
    group: GroupEntity
  ): Pto.Groups.Group & { emailResults: Pto.Groups.GroupEmailResult[] } {
    const groupPto = this.mapEntityToPto(group) as Pto.Groups.Group
    return {
      ...groupPto,
      emailResults: group.emailResults || []
    }
  }

  private mapEntityToPopulatedPto(group: GroupEntity): Pto.Groups.PopulatedGroup {
    const groupPto = this.mapEntityToPto(group)
    return {
      ...groupPto,
      category: group.category,
      users: group.users,
      emailResults: group.emailResults || []
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

  async bulkCreateFromCsv(
    groups: {
      name: string
      categoryName: string
      numberOfParticipants: number
      emails: string[]
    }[]
  ) {
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
  
    let hasEmailResults: boolean | undefined

    if (query.hasEmailResults === undefined) {
      hasEmailResults = undefined // not provided → all groups
    } else {
      hasEmailResults = typeof query.hasEmailResults === 'boolean' ? query.hasEmailResults : query.hasEmailResults === 'true'
    }
  
    const offset = (page - 1) * size
    const replacements: Record<string, any> = { limit: size, offset }
  
    // 1️⃣ Build WHERE clauses
    let whereClauses: string[] = []
  
    if (searchText) {
      replacements.searchText = `%${searchText}%`
      const parsedParticipants = Number(searchText)
      whereClauses.push(`g.name ILIKE :searchText`)
      if (!Number.isNaN(parsedParticipants)) {
        whereClauses.push(`g."numberOfParticipants" = :parsedParticipants`)
        replacements.parsedParticipants = parsedParticipants
      }
    }
  
    if (categoryIds) {
      const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds]
      whereClauses.push(`g."categoryId" IN (:categoryIds)`)
      replacements.categoryIds = ids
    }
  
    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
  
    // 2️⃣ Build HAVING clause for emailResults
    let havingClause = ''
    if (hasEmailResults === true) havingClause = 'HAVING COUNT(er.id) > 0'
    else if (hasEmailResults === false) havingClause = 'HAVING COUNT(er.id) = 0'
  
    replacements.hasEmailResults = hasEmailResults === true ? true : null
  
    // 3️⃣ Count total matching groups
    const countSQL = `
      SELECT COUNT(*) AS total
      FROM (
        SELECT g.id
        FROM "Groups" g
        LEFT JOIN "GroupEmailResults" er
          ON g.id = er."groupId" AND (:hasEmailResults IS NULL OR er.success = true)
        ${whereSQL}
        GROUP BY g.id
        ${havingClause}
      ) sub
    `
  
    const countResult = await this.sequelize.query(countSQL, {
      type: QueryTypes.SELECT,
      replacements
    })
    const total = Number((countResult[0] as { total: string | number }).total)
  
    // 4️⃣ Get paginated data
    const dataSQL = `
      SELECT 
        g.id, g.name, g."numberOfParticipants", g."categoryId", g.emails, g."createdAt", g."updatedAt",
        c.id AS "category.id",
        c.name AS "category.name",
        c.description AS "category.description",
        c.color AS "category.color",
        COALESCE(json_agg(er.*) FILTER (WHERE er.id IS NOT NULL), '[]') AS "emailResults"
      FROM "Groups" g
      LEFT JOIN "Categories" c ON g."categoryId" = c.id
      LEFT JOIN "GroupEmailResults" er ON g.id = er."groupId" AND (:hasEmailResults IS NULL OR er.success = true)
      ${whereSQL}
      GROUP BY g.id, g.name, g."numberOfParticipants", g."categoryId", g.emails, g."createdAt", g."updatedAt", c.id
      ${havingClause}
      ORDER BY g.name ASC
      LIMIT :limit OFFSET :offset
    `
  
    const results = await this.sequelize.query(dataSQL, {
      type: QueryTypes.SELECT,
      replacements
    })
  
    // 5️⃣ Map results to your DTO
    const items: Pto.Groups.GroupList['items'] = results.map((row: any) => ({
      id: row.id,
      name: row.name,
      numberOfParticipants: row.numberOfParticipants,
      categoryId: row.categoryId,
      category: {
        id: row['category.id'],
        name: row['category.name'],
        description: row['category.description'],
        color: row['category.color']
      },
      emails: row.emails,
      emailResults: row.emailResults
    }))
  
    return { total, items }
  }
  

  async findPopulatedOne(id: string): Promise<Pto.Groups.PopulatedGroup> {
    const group = await this.groupRepo.findByPk(id, {
      include: [CategoryEntity, UserEntity, GroupEmailResultEntity]
    })

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
      emails: Array.isArray(updateGroupDto.emails) ? updateGroupDto.emails : group.emails
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

  async sendGroupCodeEmails(
    groupIds: string[]
  ): Promise<{ email: string; groupId: string; success: boolean; info?: any; error?: string }[]> {
    const game = await this.gamesService.findOne()
    const groups = await this.groupRepo.findAll({ where: { id: { [Op.in]: groupIds } } })
    if (groups.length !== groupIds.length) {
      throw new NotFoundException(Pto.Errors.Messages.GROUP_NOT_FOUND)
    }
    const results: { email: string; groupId: string; success: boolean; info?: any; error?: string }[] = []

    for (const group of groups) {
      const result = await this.emailService.sendGroupCodeEmail(game, group)
      results.push(...result)
    }
    await this.groupEmailResultRepo.bulkCreate(results)

    return results
  }
}
