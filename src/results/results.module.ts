import { Module } from '@nestjs/common'
import { ResultsService } from './results.service'
import { ResultsController } from './results.controller'
import { ResultEntity } from './entities/result.entity'
import { SequelizeModule } from '@nestjs/sequelize'
import { NodeEntity } from 'src/nodes/entities/node.entity'
import { AnswerEntity } from 'src/nodes/entities/answer.entity'
import { GroupEntity } from 'src/groups/entities/group.entity'

@Module({
  imports: [SequelizeModule.forFeature([ResultEntity, GroupEntity, NodeEntity, AnswerEntity])],
  controllers: [ResultsController],
  providers: [ResultsService]
})
export class ResultsModule {}
