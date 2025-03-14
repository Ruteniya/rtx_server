import { Module } from '@nestjs/common'
import { NodesService } from './nodes.service'
import { NodesController } from './nodes.controller'
import { NodeEntity } from './entities/node.entity'
import { SequelizeModule } from '@nestjs/sequelize'
import { AnswerEntity } from './entities/answer.entity'
import { AnswerController } from './answer.controller'
import { AnswersService } from './answers.service'

@Module({
  imports: [SequelizeModule.forFeature([NodeEntity, AnswerEntity])],
  controllers: [NodesController, AnswerController],
  providers: [NodesService, AnswersService]
})
export class NodesModule {}
