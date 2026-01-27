import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { NodeAttributes, NodeEntity } from './entities/node.entity'
import { Pto } from 'rtxtypes'
import { AnswerEntity } from './entities/answer.entity'
import { S3Service } from 'src/s3/s3.service'
import { Multer } from 'multer'
import { Attributes, CreationAttributes, Op, where, WhereOptions } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'

const NODES_DIRECTORY = 'nodes'

@Injectable()
export class NodesService {
  constructor(
    @InjectModel(NodeEntity)
    private readonly nodeRepo: typeof NodeEntity,

    @InjectModel(AnswerEntity)
    private readonly answerRepo: typeof AnswerEntity,

    private readonly s3Service: S3Service
  ) {}

  private async mapNodeToPto(node: NodeEntity): Promise<Pto.Nodes.Node> {
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
      comment: node.comment
    }
  }

  private async mapNodeToShortPto(node: NodeEntity): Promise<Pto.Nodes.ShortNode> {
    return {
      id: node.id,
      name: node.name,
      answerType: node.answerType,
      question: node.question,
      questionImage: node.questionImage ? await this.s3Service.getSignedUrl(node.questionImage) : '',
      points: node.points,
      comment: node.comment,
      color: node.color
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
        return aIsNum ? -1 : 1
      }
    })
  }

  async createNode(
    createNodeDto: Pto.Nodes.CreateNode,
    questionImageFile?: Multer.File,
    correctAnswerFile?: Multer.File
  ): Promise<Pto.Nodes.Node> {
    const existingNode = await this.nodeRepo.findOne({ where: { name: createNodeDto.name } })
    const data: CreationAttributes<NodeEntity> = { ...createNodeDto }
    if (existingNode) {
      throw new BadRequestException(Pto.Errors.Messages.NODE_ALREADY_EXISTS)
    }

    if (questionImageFile) {
      data.questionImage = await this.s3Service.uploadFile(questionImageFile, NODES_DIRECTORY)
    }

    if (correctAnswerFile) {
      data.correctAnswer = await this.s3Service.uploadFile(correctAnswerFile, NODES_DIRECTORY)
    }

    const node = await this.nodeRepo.create(data)
    return await this.mapNodeToPto(node)
  }

  async findAllNodesSmall(options: Pto.Nodes.NodesListQuery): Promise<Pto.Nodes.NodeSmallList> {
    const { searchText } = options
    const where: WhereOptions<NodeAttributes> = {}

    if (searchText) {
      where[Op.or] = [
        Sequelize.literal(`LOWER("name") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("question") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("correctAnswer") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("adminDescription") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("color") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("comment") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("answerType") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`CAST("points" AS TEXT) LIKE '%${searchText}%'`)
      ]
    }

    const nodes = await this.nodeRepo.findAll({
      attributes: ['id', 'name', 'answerType', 'question', 'points', 'color'],
      order: [['name', 'ASC']],
      where
    })
    const sortedNodes = this.sortByNaturalOrder(nodes, 'name')

    return { items: sortedNodes.map(this.mapNodeToSmallPto), total: nodes.length }
  }

  async findAllNodesShort(): Promise<Pto.Nodes.ShortNodeList> {
    const nodes = await this.nodeRepo.findAll({ order: [['name', 'ASC']] })
    const items = await Promise.all(nodes.map((node) => this.mapNodeToShortPto(node)))
    return { items, total: nodes.length }
  }

  async findAllNodes(): Promise<Pto.Nodes.NodeList> {
    const nodes = await this.nodeRepo.findAll({ order: [['name', 'ASC']] })

    const sortedNodes = this.sortByNaturalOrder(nodes, 'name')
    const items = await Promise.all(sortedNodes.map((node) => this.mapNodeToPto(node)))
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
    const node = await this.nodeRepo.findByPk(id)
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
    const node = await this.nodeRepo.findByPk(id)
    const data: Partial<Attributes<NodeEntity>> = { ...updateNodeDto }
    if (!node) throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)

    // Check if answerType is being changed
    if (data.answerType !== undefined && data.answerType !== node.answerType) {
      const answer = await this.answerRepo.findOne({ where: { nodeId: node.id } })
      if (answer) {
        throw new ForbiddenException('Cannot update answerType when node has answers')
      }
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

    await node.update(data)
    return await this.mapNodeToPto(node)
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
}
