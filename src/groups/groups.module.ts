import { Module } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { GroupEntity } from './entities/group.entity'
import { SequelizeModule } from '@nestjs/sequelize'

@Module({
  imports: [SequelizeModule.forFeature([GroupEntity])],
  controllers: [GroupsController],
  providers: [GroupsService]
})
export class GroupsModule {}
