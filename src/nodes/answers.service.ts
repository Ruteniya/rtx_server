import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { NodeEntity } from './entities/node.entity'
import { Pto } from 'rtxtypes'
import { AnswerAttributes, AnswerEntity } from './entities/answer.entity'
import { JwtUser } from 'src/auth/types/auth.jwtPayload'
import { Op, Order, Sequelize, WhereOptions } from 'sequelize'
import { GroupEntity } from 'src/groups/entities/group.entity'
import { CategoryEntity } from 'src/categories/entities/category.entity'
import { GamesService } from 'src/games/games.service'

@Injectable()
export class AnswersService {
  constructor(
    @InjectModel(AnswerEntity)
    private readonly answerRepo: typeof AnswerEntity
  ) {}

  private mapAnswerToPto(answer: AnswerEntity): Pto.Answers.Answer {
    return {
      id: answer.id,
      userId: answer.userId,
      groupId: answer.groupId,
      nodeId: answer.nodeId,
      answerValue: answer.answerValue,
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

  private mapAnswerToPopulatedPto(answer: AnswerEntity): Pto.Answers.PopulatedAnswer {
    const answerPto = this.mapAnswerToPto(answer)
    return {
      ...answerPto,
      node: answer.node,
      group: answer.group
    }
  }

  async getAnswers(groupId): Promise<Pto.Answers.Answer[]> {
    const answers = await this.answerRepo.findAll({ where: { groupId } })

    return answers.map(this.mapAnswerToPto)
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
      // for postgres
      // where[Op.or] = [
      //   { answerValue: { [Op.iLike]: `%${searchText}%` } }, // Case-insensitive search
      //   { userComment: { [Op.iLike]: `%${searchText}%` } }, // Case-insensitive search
      //   { '$node.name$': { [Op.iLike]: `%${searchText}%` } }, // Assuming 'node' is a relation and you use Sequelize's associations
      //   { '$node.question$': { [Op.iLike]: `%${searchText}%` } }, // Case-insensitive search
      //   { '$node.correctAnswer$': { [Op.iLike]: `%${searchText}%` } }, // Case-insensitive search
      //   { '$node.adminDescription$': { [Op.iLike]: `%${searchText}%` } } // Case-insensitive search
      // ]

      where[Op.or] = [
        Sequelize.literal(`LOWER(answerValue) LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER(userComment) LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER(node.name) LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER(node.question) LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER(node.correctAnswer) LIKE LOWER('%${searchText}%')`),
        Sequelize.literal(`LOWER(node.adminDescription) LIKE LOWER('%${searchText}%')`)
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

    return { total: result.count, items: result.rows?.map((answer) => this.mapAnswerToPopulatedPto(answer)) }
  }

  async getAnswer(id: string, groupId: string) {
    const answer = await this.answerRepo.findOne({ where: { id, groupId } })

    if (!answer) throw new NotFoundException(Pto.Errors.Messages.ANSWER_NOT_FOUND)

    return this.mapAnswerToPto(answer)
  }

  async giveAnswer(addAnswer: Pto.Answers.AddAnswer, user: JwtUser) {
    const { id: userId, groupId } = user
    const { nodeId, answerValue, userComment } = addAnswer
    if (!groupId) throw new NotFoundException(Pto.Errors.Messages.GROUP_NOT_FOUND)
    const existingAnswer = await this.answerRepo.findOne({ where: { groupId, nodeId } })

    let finalAnswer
    if (existingAnswer) {
      if (existingAnswer.correct) throw new ForbiddenException(Pto.Errors.Messages.ANSWER_ALREADY_EXISTS)
      /// update and set processed and correct to false
      finalAnswer = await existingAnswer.update({
        answerValue,
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
        answerValue,
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
