import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { NodeEntity } from './entities/node.entity'
import { Pto } from '@rtx/types'

@Injectable()
export class NodesService {
  constructor(
    @InjectModel(NodeEntity)
    private readonly nodeRepo: typeof NodeEntity
  ) {}

  private mapEntityToPto(node: NodeEntity): Pto.Nodes.Node {
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

  private mapEntityToShortPto(node: NodeEntity): Pto.Nodes.ShortNode {
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

  async create(createNodeDto: Pto.Nodes.CreateNode): Promise<Pto.Nodes.Node> {
    const existingNode = await this.nodeRepo.findOne({ where: { name: createNodeDto.name } })
    if (existingNode) {
      throw new BadRequestException(Pto.Errors.Messages.NODE_ALREADY_EXISTS)
    }
    const node = await this.nodeRepo.create(createNodeDto)
    return this.mapEntityToPto(node)
  }

  async findAllShortVersion(): Promise<Pto.Nodes.ShortNodeList> {
    const nodes = await this.nodeRepo.findAll()
    return { items: nodes.map(this.mapEntityToShortPto), total: nodes.length }
  }

  async findAll(): Promise<Pto.Nodes.NodeList> {
    const nodes = await this.nodeRepo.findAll()
    return { items: nodes.map(this.mapEntityToPto), total: nodes.length }
  }

  async findOne(id: string): Promise<Pto.Nodes.Node> {
    const node = await this.nodeRepo.findByPk(id)
    if (!node) {
      throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)
    }
    return this.mapEntityToPto(node)
  }

  // async update(id: string, updateNodeDto: Pto.Nodes.UpdateNode): Promise<Pto.Nodes.Node> {
  //   const node = await this.nodeRepo.findByPk(id)
  //   if (!node) {
  //     throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)
  //   }
  //   await node.update(updateNodeDto)
  //   return this.mapEntityToPto(node)
  // }

  async remove(id: string): Promise<void> {
    const node = await this.nodeRepo.findByPk(id)
    if (!node) {
      throw new NotFoundException(Pto.Errors.Messages.NODE_NOT_FOUND)
    }
    await node.destroy()
  }
}
