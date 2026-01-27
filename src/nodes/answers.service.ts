import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { NodeEntity } from './entities/node.entity'
import { Pto } from 'rtxtypes'
import { AnswerAttributes, AnswerEntity } from './entities/answer.entity'
import { JwtUser } from 'src/auth/types/auth.jwtPayload'
import { Op, Sequelize, WhereOptions } from 'sequelize'
import { GroupEntity } from 'src/groups/entities/group.entity'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { S3Service } from 'src/s3/s3.service'
import { Multer } from 'multer'

const ANSWERS_DIRECTORY = 'answers'

@Injectable()
export class AnswersService {
  constructor(
    @InjectModel(AnswerEntity)
    private readonly answerRepo: typeof AnswerEntity,
    private readonly s3Service: S3Service
  ) {}

  private async mapAnswerToPto(answer: AnswerEntity, node: NodeEntity): Promise<Pto.Answers.Answer> {
    let answerValue = answer.answerValue
    if (answerValue && node.answerType === Pto.Nodes.AnswerType.Photo) {
      answerValue = await this.s3Service.getSignedUrl(answerValue)
    }

    return {
      id: answer.id,
      userId: answer.userId,
      groupId: answer.groupId,
      nodeId: answer.nodeId,
      answerValue,
      userComment: answer.userComment,
      processed: answer.processed,
      correct: answer.correct,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt
    }
  }

  private mapAnswerToSmallPto(answer: AnswerEntity): Pto.Answers.AnswerSmall {
    return {
      id: answer.id,
      userId: answer.userId,
      groupId: answer.groupId,
      nodeId: answer.nodeId,
      processed: answer.processed,
      correct: answer.correct
    }
  }

  private async mapAnswerToPopulatedPto(answer: AnswerEntity): Promise<Pto.Answers.PopulatedAnswer> {
    const answerPto = await this.mapAnswerToPto(answer, answer.node)
    const node = await this.mapNodeToPto(answer.node)
    return {
      ...answerPto,
      node,
      group: answer.group
    }
  }

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
      comment: node.comment,
      color: node.color
    }
  }

  async getAnswers(groupId): Promise<Pto.Answers.AnswerSmall[]> {
    const answers = await this.answerRepo.findAll({ where: { groupId } })

    return Promise.all(answers.map((answer) => this.mapAnswerToSmallPto(answer)))
  }

  async getAnswersSmall(groupId): Promise<Pto.Answers.AnswersSmallList> {
    const answers = await this.answerRepo.findAll({
      where: { groupId },
      attributes: ['id', 'userId', 'groupId', 'nodeId', 'processed', 'correct'] // Вибираємо лише потрібні атрибути
    })

    return { total: answers.length, items: answers.map(this.mapAnswerToSmallPto) }
  }

  async getAllAnswers(query: Pto.Answers.AnswerListQuery): Promise<Pto.Answers.AnswersList> {
    const {
      searchText,
      processed,
      correct,
      groupIds,
      updatedAt,
      page = 1,
      size = 10,
      sortBy = 'updatedAt',
      sortOrder = 'DESC'
    } = query

    const where: WhereOptions<AnswerAttributes> = {}

    if (searchText) {
      where[Op.or] = [
        Sequelize.literal(`LOWER("answerValue") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("userComment") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("node"."name") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("node"."question") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("node"."correctAnswer") LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER("node"."adminDescription") LIKE LOWER('%${searchText}%')`)
      ]
    }

    if (processed !== undefined) where.processed = processed
    if (correct !== undefined) where.correct = correct
    if (groupIds?.length) where.groupId = { [Op.in]: groupIds }
    if (updatedAt) where.updatedAt = { [Op.gte]: updatedAt }

    const result = await this.answerRepo.findAndCountAll({
      distinct: true,
      col: 'id',
      where,
      offset: (page - 1) * size,
      limit: Number(size),
      include: [
        NodeEntity,
        {
          model: GroupEntity,
          include: [
            {
              model: CategoryEntity,
              required: true
            }
          ],
          required: true
        }
      ]
    })

    return {
      total: result.count,
      items: await Promise.all(result.rows?.map((answer) => this.mapAnswerToPopulatedPto(answer)) || [])
    }
  }

  async getAnswer(id: string, groupId: string) {
    const answer = await this.answerRepo.findOne({ where: { id, groupId }, include: [NodeEntity] })

    if (!answer) throw new NotFoundException(Pto.Errors.Messages.ANSWER_NOT_FOUND)

    return await this.mapAnswerToPto(answer, answer.node)
  }

  async giveAnswer(
    addAnswer: Omit<Pto.Answers.AddAnswer, 'answerValue'> & { answerValue?: string },
    user: JwtUser,
    answerFile?: Multer.File
  ) {
    const { id: userId, groupId } = user
    const { nodeId, answerValue, userComment } = addAnswer
    if (!groupId) throw new NotFoundException(Pto.Errors.Messages.GROUP_NOT_FOUND)

    // Validate that either answerValue or answerFile is provided
    if (!answerValue && !answerFile) {
      throw new BadRequestException('Either answerValue or answerFile must be provided')
    }

    const existingAnswer = await this.answerRepo.findOne({ where: { groupId, nodeId } })

    let finalAnswerValue: string

    // If file is provided, upload it to S3
    if (answerFile) {
      finalAnswerValue = await this.s3Service.uploadFile(answerFile, ANSWERS_DIRECTORY)
      // Delete old file if updating an existing answer
      if (existingAnswer && existingAnswer.answerValue?.startsWith(`${ANSWERS_DIRECTORY}/`)) {
        try {
          await this.s3Service.deleteFile(existingAnswer.answerValue)
        } catch (e) {
          console.warn('Failed to delete old answer file from S3', e)
        }
      }
    } else {
      finalAnswerValue = answerValue!
      // If updating and old value was a file, delete it
      if (existingAnswer && existingAnswer.answerValue?.startsWith(`${ANSWERS_DIRECTORY}/`)) {
        try {
          await this.s3Service.deleteFile(existingAnswer.answerValue)
        } catch (e) {
          console.warn('Failed to delete old answer file from S3', e)
        }
      }
    }

    let finalAnswer
    if (existingAnswer) {
      if (existingAnswer.correct) throw new ForbiddenException(Pto.Errors.Messages.ANSWER_ALREADY_EXISTS)
      /// update and set processed and correct to false
      finalAnswer = await existingAnswer.update({
        answerValue: finalAnswerValue,
        userComment,
        processed: false,
        correct: false
      })
    } else {
      //create
      finalAnswer = await this.answerRepo.create({
        userId,
        groupId,
        nodeId,
        answerValue: finalAnswerValue,
        userComment,
        processed: false,
        correct: false
      })
    }
    return this.mapAnswerToSmallPto(finalAnswer)
  }

  async evaluateAnswers(evaluateAnswers: Pto.Answers.EvaluateAnswer[]) {
    if (!evaluateAnswers.length) {
      throw new BadRequestException('Не передано жодної відповіді для оцінки.')
    }

    const answerIds = evaluateAnswers.map(({ answerId }) => answerId)
    const answers = await this.answerRepo.findAll({
      where: { id: { [Op.in]: answerIds } }
    })

    if (answers.length !== evaluateAnswers.length) {
      throw new NotFoundException(Pto.Errors.Messages.ANSWER_NOT_FOUND)
    }

    const updatePromises = evaluateAnswers.map(({ answerId, correct }) => {
      return this.answerRepo.update({ correct, processed: true }, { where: { id: answerId } })
    })

    await Promise.all(updatePromises)
  }
}
