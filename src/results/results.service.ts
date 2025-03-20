import { Injectable } from '@nestjs/common'
import { ResultEntity } from './entities/result.entity'
import { InjectModel } from '@nestjs/sequelize'
import { NodeEntity } from 'src/nodes/entities/node.entity'
import { CreationAttributes } from 'sequelize'
import { Pto } from '@rtx/types'
import { AnswerEntity } from 'src/nodes/entities/answer.entity'
import { GroupEntity } from 'src/groups/entities/group.entity'
import { CategoryEntity } from 'src/categories/entities/category.entity'

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(ResultEntity)
    private readonly resultRepo: typeof ResultEntity,

    @InjectModel(AnswerEntity)
    private readonly answerRepo: typeof AnswerEntity,

    @InjectModel(GroupEntity)
    private readonly groupRepo: typeof GroupEntity
  ) {}

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

  async findAll(): Promise<Pto.Results.ResultPopulated[]> {
    return await this.groupRepo.findAll({
      include: [
        CategoryEntity,
        {
          model: ResultEntity, // Ensure that ResultEntity is correctly defined as a model
          as: 'results' // This should match the alias used in the relationship definition, if any,
        }
      ]
    })
  }
}
