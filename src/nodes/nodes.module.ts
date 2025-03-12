import { Module } from '@nestjs/common'
import { NodesService } from './nodes.service'
import { NodesController } from './nodes.controller'
import { NodeEntity } from './entities/node.entity'
import { SequelizeModule } from '@nestjs/sequelize'

@Module({
  imports: [SequelizeModule.forFeature([NodeEntity])],
  controllers: [NodesController],
  providers: [NodesService]
})
export class NodesModule {}
