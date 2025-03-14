import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { NodeEntity } from './entities/node.entity'
import { Pto } from '@rtx/types'
import { AnswerAttributes, AnswerEntity } from './entities/answer.entity'
import { JwtUser } from 'src/auth/types/auth.jwtPayload'
import { Op, WhereOptions } from 'sequelize'

@Injectable()
export class AnswersService {
  constructor(
    @InjectModel(NodeEntity)
    private readonly nodeRepo: typeof NodeEntity,

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

  async getAnswers(groupId): Promise<Pto.Answers.Answer[]> {
    const answers = await this.answerRepo.findAll({ where: { groupId } })

    return answers.map(this.mapAnswerToPto)
  }

  async getAllAnswers(query: Pto.Answers.AnswerListQuery): Promise<Pto.Answers.AnswersList> {
    const { searchText, processed, correct, groupIds, updatedAt, page = 1, size = 10 } = query

    const where: WhereOptions<AnswerAttributes> = {}

    if (searchText) where.answerValue = { [Op.like]: `%${searchText}%` }
    if (processed !== undefined) where.processed = processed
    if (correct !== undefined) where.correct = correct
    if (groupIds?.length) where.groupId = { [Op.in]: groupIds }
    if (updatedAt) where.updatedAt = { [Op.gte]: updatedAt }

    const result = await this.answerRepo.findAndCountAll({
      distinct: true,
      col: 'id',
      where,
      offset: (page - 1) * size,
      limit: size,
      order: [['updatedAt', 'DESC']]
    })

    return { total: result.count, items: result.rows.map(this.mapAnswerToPto) }
  }

  // answers
  async giveAnswer(addAnswer: Pto.Answers.AddAnswer, user: JwtUser) {
    const { id: userId, groupId } = user
    const { nodeId, answerValue, userComment } = addAnswer
    const existingAnswer = await this.answerRepo.findOne({ where: { groupId, nodeId } })
    if (!groupId) throw new NotFoundException(Pto.Errors.Messages.GROUP_NOT_FOUND)
    if (existingAnswer) {
      /// update and set processed and correct to false
      await existingAnswer.update({
        answerValue,
        userComment,
        processed: false,
        correct: false
      })
    } else {
      //create
      await this.answerRepo.create({
        userId,
        groupId,
        nodeId,
        answerValue,
        userComment,
        processed: false,
        correct: false
      })
    }
  }
}
