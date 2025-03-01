import { Module } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CategoriesController } from './categories.controller'
import { CategoryEntity } from './entities/category.entity'
import { SequelizeModule } from '@nestjs/sequelize'

@Module({
  imports: [SequelizeModule.forFeature([CategoryEntity])],
  controllers: [CategoriesController],
  providers: [CategoriesService]
})
export class CategoriesModule {}
