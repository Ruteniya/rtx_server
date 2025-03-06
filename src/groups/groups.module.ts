import { Module } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { GroupEntity } from './entities/group.entity'
import { SequelizeModule } from '@nestjs/sequelize'
import { CategoryEntity } from 'src/categories/entities/category.entity'

@Module({
  imports: [SequelizeModule.forFeature([GroupEntity, CategoryEntity])],
  controllers: [GroupsController],
  providers: [GroupsService]
})
export class GroupsModule {}
