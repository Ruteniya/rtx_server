import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { NodeEntity } from './entities/node.entity'
import { Pto } from 'rtxtypes'
import { AnswerEntity } from './entities/answer.entity'

@Injectable()
export class NodesService {
  constructor(
    @InjectModel(NodeEntity)
    private readonly nodeRepo: typeof NodeEntity,

    @InjectModel(AnswerEntity)
    private readonly answerRepo: typeof AnswerEntity
  ) {}

  private mapNodeToPto(node: NodeEntity): Pto.Nodes.Node {
    return {
      id: node.id,
      name: node.name,
      answerType: node.answerType,
      question: node.question,
      questionImage: node.questionImage,
      adminDescription: node.adminDescription,
      correctAnswer: node.correctAnswer,
      points: node.points,
      comment: node.comment
    }
  }

  private mapNodeToShortPto(node: NodeEntity): Pto.Nodes.ShortNode {
    return {
      id: node.id,
      name: node.name,
      answerType: node.answerType,
      question: node.question,
      questionImage: node.questionImage,
      points: node.points,
      comment: node.comment
    }
  }
  private mapNodeToSmallPto(node: NodeEntity): Pto.Nodes.NodeSmall {
    return {
      id: node.id,
      name: node.name,
      answerType: node.answerType,
      question: node.question,
      points: node.points
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
        return aNum - bNum // Обидва числа → сортуємо як числа
      } else if (!aIsNum && !bIsNum) {
        return aValue.localeCompare(bValue, undefined, { numeric: true }) // Обидва рядки → сортуємо як текст
      } else {
        return aIsNum ? -1 : 1 // Число перед рядком
      }
    })
  }

  async createNode(createNodeDto: Pto.Nodes.CreateNode): Promise<Pto.Nodes.Node> {
    const existingNode = await this.nodeRepo.findOne({ where: { name: createNodeDto.name } })
    if (existingNode) {
      throw new BadRequestException(Pto.Errors.Messages.NODE_ALREADY_EXISTS)
    }
    const node = await this.nodeRepo.create(createNodeDto)
    return this.mapNodeToPto(node)
  }

  async findAllNodesSmall(): Promise<Pto.Nodes.NodeSmallList> {
    const nodes = await this.nodeRepo.findAll({
      attributes: ['id', 'name', 'answerType', 'question', 'points'],
      order: [['name', 'ASC']]
    })
    const sortedNodes = this.sortByNaturalOrder(nodes, 'name')

    return { items: sortedNodes.map(this.mapNodeToSmallPto), total: nodes.length }
  }

  async findAllNodesShort(): Promise<Pto.Nodes.ShortNodeList> {
    const nodes = await this.nodeRepo.findAll({ order: [['name', 'ASC']] })
    return { items: nodes.map(this.mapNodeToShortPto), total: nodes.length }
  }

  async findAllNodes(): Promise<Pto.Nodes.NodeList> {
    const nodes = await this.nodeRepo.findAll({ order: [['name', 'ASC']] })
    const sortedNodes = this.sortByNaturalOrder(nodes, 'name')

    return { items: sortedNodes.map(this.mapNodeToPto), total: nodes.length }
  }

  async findShortNode(id: string): Promise<Pto.Nodes.ShortNode> {
    const node = await this.nodeRepo.findByPk(id)
    if (!node) {
      throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)
    }
    return this.mapNodeToShortPto(node)
  }

  async findNode(id: string): Promise<Pto.Nodes.Node> {
    const node = await this.nodeRepo.findByPk(id)
    if (!node) {
      throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)
    }
    return this.mapNodeToPto(node)
  }

  async updateNode(id: string, updateNodeDto: Pto.Nodes.UpdateNode): Promise<Pto.Nodes.Node> {
    const node = await this.nodeRepo.findByPk(id)
    if (!node) {
      throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)
    }

    const answer = await this.answerRepo.findOne({ where: { nodeId: node.id } })
    if (answer) throw new ForbiddenException(Pto.Errors.Messages.NODE_CANNOT_BE_UPDATED)
    await node.update(updateNodeDto)
    return this.mapNodeToPto(node)
  }

  async removeNode(id: string): Promise<void> {
    const node = await this.nodeRepo.findByPk(id)
    if (!node) {
      throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)
    }
    await node.destroy()
  }
}
