import { Module } from '@nestjs/common'
import { NodesService } from './nodes.service'
import { NodesController } from './nodes.controller'
import { NodeEntity } from './entities/node.entity'
import { SequelizeModule } from '@nestjs/sequelize'
import { AnswerEntity } from './entities/answer.entity'
import { AnswerController } from './answer.controller'
import { AnswersService } from './answers.service'
import { GamesModule } from 'src/games/games.module'

@Module({
  imports: [SequelizeModule.forFeature([NodeEntity, AnswerEntity]), GamesModule],
  controllers: [NodesController, AnswerController],
  providers: [NodesService, AnswersService]
})
export class NodesModule {}
