import { Module } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CategoriesController } from './categories.controller'
import { CategoryEntity } from './entities/category.entity'
import { SequelizeModule } from '@nestjs/sequelize'
import { GroupEntity } from 'src/groups/entities/group.entity'

@Module({
  imports: [SequelizeModule.forFeature([CategoryEntity, GroupEntity])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule {}
