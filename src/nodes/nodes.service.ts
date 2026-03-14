import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { NodeAttributes, NodeEntity } from './entities/node.entity'
import { Pto } from 'rtxtypes'
import { AnswerEntity } from './entities/answer.entity'
import { S3Service } from 'src/s3/s3.service'
import { Multer } from 'multer'
import { Attributes, CreationAttributes, Op, Transaction, WhereOptions } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { CategoryEntity } from 'src/categories/entities/category.entity'

const NODES_DIRECTORY = 'nodes'

@Injectable()
export class NodesService {
  constructor(
    @InjectModel(NodeEntity)
    private readonly nodeRepo: typeof NodeEntity,

    @InjectModel(AnswerEntity)
    private readonly answerRepo: typeof AnswerEntity,

    @InjectModel(CategoryEntity)
    private readonly categoryRepo: typeof CategoryEntity,

    private readonly sequelize: Sequelize,

    private readonly s3Service: S3Service
  ) {}

  private async mapNodeToPto(node: NodeEntity): Promise<Pto.Nodes.Node> {
    const categoryIds = node.categories?.map((category) => category.id) || []
    return {
      id: node.id,
      name: node.name,
      answerType: node.answerType,
      question: node.question,
      questionImage: node.questionImage ? await this.s3Service.getSignedUrl(node.questionImage) : '',
      adminDescription: node.adminDescription,
      correctAnswer:
        node.answerType === Pto.Nodes.AnswerType.Photo && node.correctAnswer
          ? await this.s3Service.getSignedUrl(node.correctAnswer)
          : node.correctAnswer,
      points: node.points,
      color: node.color,
      comment: node.comment,
      categoryIds: categoryIds
    }
  }

  private async mapNodeToShortPto(node: NodeEntity): Promise<Pto.Nodes.ShortNode> {
    const categoryIds = node.categories?.map((category) => category.id) || []
    return {
      id: node.id,
      name: node.name,
      answerType: node.answerType,
      question: node.question,
      questionImage: node.questionImage ? await this.s3Service.getSignedUrl(node.questionImage) : '',
      points: node.points,
      comment: node.comment,
      color: node.color,
      categoryIds: categoryIds
    }
  }
  private mapNodeToSmallPto(node: NodeEntity): Pto.Nodes.NodeSmall {
    return {
      id: node.id,
      name: node.name,
      answerType: node.answerType,
      question: node.question,
      points: node.points,
      color: node.color
    }
  }

  private sortByNaturalOrder<T>(items: T[], key: keyof T): T[] {
    return items.sort((a, b) => {
      const aValue = String(a[key])
      const bValue = String(b[key])

      const aNum = Number(aValue)
      const bNum = Number(bValue)

      const aIsNum = !isNaN(aNum)
      const bIsNum = !isNaN(bNum)

      if (aIsNum && bIsNum) {
        return aNum - bNum
      } else if (!aIsNum && !bIsNum) {
        return aValue.localeCompare(bValue, undefined, { numeric: true })
      } else {
        return aIsNum ? 1 : -1
      }
    })
  }

  private async validateCategories(categoryIds: string[], transaction: Transaction): Promise<string[]> {
    const uniqueCategoryIds = [...new Set(categoryIds || [])]
    if (!uniqueCategoryIds.length) {
      throw new BadRequestException('categoryIds must not be empty')
    }
    const categories = await this.categoryRepo.findAll({
      where: { id: { [Op.in]: uniqueCategoryIds } },
      attributes: ['id'],
      transaction
    })
    if (categories.length !== uniqueCategoryIds.length) {
      throw new BadRequestException(Pto.Errors.Messages.CATEGORY_NOT_FOUND)
    }

    return uniqueCategoryIds
  }

  async createNode(
    createNodeDto: Pto.Nodes.CreateNode,
    questionImageFile?: Multer.File,
    correctAnswerFile?: Multer.File
  ): Promise<Pto.Nodes.Node> {
    return await this.sequelize.transaction(async (transaction) => {
      const existingNode = await this.nodeRepo.findOne({
        where: { name: createNodeDto.name },
        transaction
      })

      if (existingNode) {
        throw new BadRequestException(Pto.Errors.Messages.NODE_ALREADY_EXISTS)
      }

      const { categoryIds, ...nodeData } = createNodeDto
      const data: CreationAttributes<NodeEntity> = { ...nodeData }

      const uniqueCategoryIds = await this.validateCategories(categoryIds, transaction)

      if (questionImageFile) {
        data.questionImage = await this.s3Service.uploadFile(questionImageFile, NODES_DIRECTORY)
      }

      if (correctAnswerFile) {
        data.correctAnswer = await this.s3Service.uploadFile(correctAnswerFile, NODES_DIRECTORY)
      }

      const node = await this.nodeRepo.create(data, { transaction })

      await node.$set('categories', uniqueCategoryIds, { transaction })

      await node.reload({ include: [CategoryEntity], transaction })

      return await this.mapNodeToPto(node)
    })
  }

  async findAllNodesSmall(options: Pto.Nodes.NodesListQuery): Promise<Pto.Nodes.NodeSmallList> {
    const { page = 1, size = 10, searchText, categoryIds } = options
    const offset = (page - 1) * size

    const where: WhereOptions<NodeAttributes> = {}

    // Search
    if (searchText) {
      where[Op.or] = [
        Sequelize.literal(`LOWER("NodeEntity"."name") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("NodeEntity"."question") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("NodeEntity"."correctAnswer") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("NodeEntity"."adminDescription") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("NodeEntity"."color") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("NodeEntity"."comment") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("NodeEntity"."answerType") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`CAST("NodeEntity"."points" AS TEXT) LIKE '%${searchText}%'`)
      ]
    }

    // Category filter
    const categoryIdsArray = Array.isArray(categoryIds) ? categoryIds : categoryIds ? [categoryIds] : []

    const include = categoryIdsArray.length
      ? [
          {
            model: CategoryEntity,
            as: 'categories',
            attributes: [],
            through: { attributes: [] },
            required: true,
            where: { id: { [Op.in]: categoryIdsArray } }
          }
        ]
      : []

    const result = await this.nodeRepo.findAndCountAll({
      distinct: true,
      include,
      attributes: ['id', 'name', 'answerType', 'question', 'points', 'color'],
      where,
      order: [
        [Sequelize.literal(`CASE WHEN "NodeEntity"."name" ~ '^[0-9]' THEN 1 ELSE 0 END`), 'ASC'],
        [
          Sequelize.literal(`CASE 
            WHEN "NodeEntity"."name" ~ '^[0-9]+' THEN CAST((regexp_match("NodeEntity"."name", '^([0-9]+)'))[1] AS INTEGER)
            ELSE 0
          END`),
          'ASC'
        ],
        [Sequelize.col('NodeEntity.name'), 'ASC']
      ],
      offset,
      limit: size
    })

    return { items: result.rows.map(this.mapNodeToSmallPto), total: result.count }
  }

  async findAllNodesShort(): Promise<Pto.Nodes.ShortNodeList> {
    const nodes = await this.nodeRepo.findAll({
      include: [CategoryEntity],
      order: [
        [Sequelize.literal(`CASE WHEN "NodeEntity"."name" ~ '^[0-9]' THEN 1 ELSE 0 END`), 'ASC'],
        [
          Sequelize.literal(`CASE 
            WHEN "NodeEntity"."name" ~ '^[0-9]+' THEN CAST((regexp_match("NodeEntity"."name", '^([0-9]+)'))[1] AS INTEGER)
            ELSE 0
          END`),
          'ASC'
        ],
        [Sequelize.col('NodeEntity.name'), 'ASC']
      ]
    })
    const items = await Promise.all(nodes.map((node) => this.mapNodeToShortPto(node)))
    return { items, total: nodes.length }
  }

  async findAllNodes(): Promise<Pto.Nodes.NodeList> {
    const nodes = await this.nodeRepo.findAll({
      order: [
        [Sequelize.literal(`CASE WHEN "NodeEntity"."name" ~ '^[0-9]' THEN 1 ELSE 0 END`), 'ASC'],
        [
          Sequelize.literal(`CASE 
            WHEN "NodeEntity"."name" ~ '^[0-9]+' THEN CAST((regexp_match("NodeEntity"."name", '^([0-9]+)'))[1] AS INTEGER)
            ELSE 0
          END`),
          'ASC'
        ],
        [Sequelize.col('NodeEntity.name'), 'ASC']
      ]
    })
    const items = await Promise.all(nodes.map((node) => this.mapNodeToPto(node)))
    return { items, total: nodes.length }
  }

  async findShortNode(id: string): Promise<Pto.Nodes.ShortNode> {
    const node = await this.nodeRepo.findByPk(id)
    if (!node) {
      throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)
    }
    return await this.mapNodeToShortPto(node)
  }

  async findNode(id: string): Promise<Pto.Nodes.Node> {
    const node = await this.nodeRepo.findByPk(id, { include: [CategoryEntity] })
    if (!node) {
      throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)
    }
    return await this.mapNodeToPto(node)
  }

  async updateNode(
    id: string,
    updateNodeDto: Pto.Nodes.UpdateNode,
    questionImageFile: Multer.File | undefined,
    correctAnswerFile: Multer.File | undefined,
    options: Pto.Nodes.UpdateNodeOptions
  ): Promise<Pto.Nodes.Node> {
    return await this.sequelize.transaction(async (transaction) => {
      const node = await this.nodeRepo.findByPk(id, { transaction })
      if (!node) throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)

      const { categoryIds, ...nodeData } = updateNodeDto
      const data: Partial<Attributes<NodeEntity>> = { ...nodeData }

      // Check if answerType is being changed
      if (data.answerType !== undefined && data.answerType !== node.answerType) {
        const answer = await this.answerRepo.findOne({ where: { nodeId: node.id }, transaction })
        if (answer) {
          throw new ForbiddenException('Cannot update answerType when node has answers')
        }
      }

      if (categoryIds) {
        const uniqueCategoryIds = await this.validateCategories(categoryIds, transaction)
        await node.$set('categories', uniqueCategoryIds, { transaction })
        await node.reload({ include: [CategoryEntity], transaction })
      }

      if (questionImageFile || options.deleteQuestionImage) {
        if (node.questionImage) {
          await this.s3Service.deleteFile(node.questionImage)
          data.questionImage = ''
        }
      }

      if (questionImageFile) {
        data.questionImage = await this.s3Service.uploadFile(questionImageFile, NODES_DIRECTORY)
      }

      if (correctAnswerFile || options.deleteCorrectAnswerImage) {
        if (node.correctAnswer && node.answerType === Pto.Nodes.AnswerType.Photo) {
          await this.s3Service.deleteFile(node.correctAnswer)
          data.correctAnswer = ''
        }
      }
      if (correctAnswerFile) {
        data.correctAnswer = await this.s3Service.uploadFile(correctAnswerFile, NODES_DIRECTORY)
      }

      await node.update(data, { transaction })
      return await this.mapNodeToPto(node)
    })
  }

  async removeNode(id: string): Promise<void> {
    const node = await this.nodeRepo.findByPk(id)
    if (!node) {
      throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)
    }

    if (node.questionImage) {
      try {
        await this.s3Service.deleteFile(node.questionImage)
      } catch (e) {
        console.warn('Не вдалося видалити questionImage з S3', e)
      }
    }

    if (node.correctAnswer && node.answerType === Pto.Nodes.AnswerType.Photo) {
      try {
        await this.s3Service.deleteFile(node.correctAnswer)
      } catch (e) {
        console.warn('Не вдалося видалити correctAnswer з S3', e)
      }
    }

    await node.destroy()
  }

  async deleteNodesWithoutAnswers(): Promise<{ deleted: number }> {
    const nodeIdsWithAnswers = (await this.answerRepo.findAll({ attributes: ['nodeId'], raw: true })).map(
      (r) => r.nodeId
    )
    const uniqueNodeIdsWithAnswers = [...new Set(nodeIdsWithAnswers)]

    const where: WhereOptions<NodeAttributes> =
      uniqueNodeIdsWithAnswers.length > 0 ? { id: { [Op.notIn]: uniqueNodeIdsWithAnswers } } : {}

    const nodesToDelete = await this.nodeRepo.findAll({ where })

    for (const node of nodesToDelete) {
      if (node.questionImage) {
        try {
          await this.s3Service.deleteFile(node.questionImage)
        } catch (e) {
          console.warn('Не вдалося видалити questionImage з S3', node.questionImage, e)
        }
      }
      if (node.correctAnswer && node.answerType === Pto.Nodes.AnswerType.Photo) {
        try {
          await this.s3Service.deleteFile(node.correctAnswer)
        } catch (e) {
          console.warn('Не вдалося видалити correctAnswer з S3', node.correctAnswer, e)
        }
      }
      await node.destroy()
    }

    return { deleted: nodesToDelete.length }
  }
}
