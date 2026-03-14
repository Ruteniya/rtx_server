import { Injectable } from '@nestjs/common'
import { ResultEntity } from './entities/result.entity'
import { InjectModel } from '@nestjs/sequelize'
import { NodeEntity } from 'src/nodes/entities/node.entity'
import { CreationAttributes, Op, col, fn, literal } from 'sequelize'
import { Pto } from 'rtxtypes'
import { AnswerEntity } from 'src/nodes/entities/answer.entity'
import { GroupEntity } from 'src/groups/entities/group.entity'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { S3Service } from 'src/s3/s3.service'

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(ResultEntity)
    private readonly resultRepo: typeof ResultEntity,

    @InjectModel(AnswerEntity)
    private readonly answerRepo: typeof AnswerEntity,

    @InjectModel(GroupEntity)
    private readonly groupRepo: typeof GroupEntity,
    private readonly s3Service: S3Service
  ) {}

  private mapGroupToResultPopulated(group: GroupEntity): Pto.Results.ResultPopulated {
    const results = group.results ?? []
    return {
      id: group.id,
      name: group.name,
      numberOfParticipants: group.numberOfParticipants,
      categoryId: group.categoryId,
      category: group.category,
      emails: group.emails,
      results: results.map((result) => ({
        id: result.id,
        nodeId: result.nodeId,
        groupId: result.groupId,
        earnedPoints: result.earnedPoints,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }))
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

  async deleteAllResults(): Promise<void> {
    await this.resultRepo.destroy({ where: {} })
  }

  async generateResults() {
    return this.resultRepo.sequelize?.transaction(async (transaction) => {
      await this.resultRepo.destroy({
        where: {}, // Очищає всю таблицю
        transaction
      })

      let offset = 0
      const limit = 50
      let totalAnswersProcessed = 0

      while (true) {
        const answers = await this.answerRepo.findAll({
          where: { processed: true },
          include: [
            {
              model: NodeEntity,
              required: true,
              attributes: ['id', 'points', 'name']
            }
          ],
          limit,
          offset
        })

        if (answers.length === 0) {
          break
        }

        const results: CreationAttributes<ResultEntity>[] = []

        for (const answer of answers) {
          const earnedPoints = answer.correct ? answer.node.points : 0

          results.push({
            nodeId: answer.node.id,
            groupId: answer.groupId,
            earnedPoints
          })
        }

        await this.resultRepo.bulkCreate(results, { transaction })

        offset += limit
        totalAnswersProcessed += answers.length
      }
    })
  }

  async findAll(query: Pto.Results.ResultsListQuery): Promise<Pto.Results.ResultsPopulated> {
    const { page = 1, size = 10, categoryIds, sortBy, sortOrder = 'ASC' } = query
    const offset = (page - 1) * size

    const where: { categoryId?: { [Op.in]: string[] } } = {}
    if (categoryIds?.length) {
      where.categoryId = { [Op.in]: categoryIds }
    }

    const total = await this.groupRepo.count({ where })

    if (sortBy === 'totalPoints') {
      const aggregatedGroups = await this.groupRepo.findAll({
        where,
        offset,
        limit: size,
        subQuery: false,
        include: [
          {
            model: ResultEntity,
            as: 'results',
            attributes: []
          }
        ],
        attributes: ['id', [fn('COALESCE', fn('SUM', col('results.earnedPoints')), 0), 'totalPoints']],
        group: ['GroupEntity.id'],
        order: [[literal('"totalPoints"'), sortOrder]]
      })

      const groupIds = aggregatedGroups.map((group) => group.id)
      if (groupIds.length === 0) {
        return { total, items: [] }
      }

      const groups = await this.groupRepo.findAll({
        where: { id: { [Op.in]: groupIds } },
        include: [
          CategoryEntity,
          {
            model: ResultEntity,
            as: 'results'
          }
        ]
      })

      const groupsById = new Map(groups.map((group) => [group.id, group]))
      return {
        total,
        items: groupIds
          .map((groupId) => groupsById.get(groupId))
          .filter((group): group is GroupEntity => Boolean(group))
          .map((group) => this.mapGroupToResultPopulated(group))
      }
    }

    const results = await this.groupRepo.findAndCountAll({
      offset,
      limit: size,
      where,
      order: [['name', sortOrder]],
      include: [
        CategoryEntity,
        {
          model: ResultEntity,
          as: 'results'
        }
      ]
    })
    return {
      total: results.count,
      items: results.rows.map((group) => this.mapGroupToResultPopulated(group))
    }
  }

  async exportResultsCsv(): Promise<{ url: string }> {
    const nodes = await NodeEntity.findAll({ order: [['name', 'ASC']] })
    const groups = await this.groupRepo.findAll({
      order: [['name', 'ASC']],
      include: [
        CategoryEntity,
        {
          model: ResultEntity,
          as: 'results',
          include: [NodeEntity]
        }
      ]
    })

    const header = ['Команда', 'Категорія', ...nodes.map((node) => node.name), 'Сума балів']

    const rows = groups.map((group) => {
      const pointsByNodeId = new Map<string, number>()
      for (const result of group.results ?? []) {
        const nodeId = result.nodeId
        const current = pointsByNodeId.get(nodeId) ?? 0
        pointsByNodeId.set(nodeId, current + result.earnedPoints)
      }

      const totalPoints = [...pointsByNodeId.values()].reduce((sum, value) => sum + value, 0)

      return [
        this.escapeCsvValue(group.name),
        this.escapeCsvValue(group.category?.name ?? ''),
        ...nodes.map((node) => this.escapeCsvValue(pointsByNodeId.get(node.id) ?? 0)),
        this.escapeCsvValue(totalPoints)
      ]
    })

    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n')
    const csvWithBom = `\uFEFF${csvContent}`
    const key = await this.s3Service.uploadBufferWithRandomKey(
      Buffer.from(csvWithBom, 'utf8'),
      'exports',
      'csv',
      'text/csv; charset=utf-8',
      'results'
    )
    const url = await this.s3Service.getSignedUrl(key)

    return { url }
  }
}
