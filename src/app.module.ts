import { MiddlewareConsumer, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GamesModule } from './games/games.module'
import { CategoriesModule } from './categories/categories.module'
import { GroupsModule } from './groups/groups.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { NodesModule } from './nodes/nodes.module'
import { ResultsModule } from './results/results.module'
import * as cookieParser from 'cookie-parser'
import { CategoriesService } from './categories/categories.service'
import { GroupsService } from './groups/groups.service'
import { UsersService } from './users/users.service'
import { Seeder } from './seeder/seeder'
import { SequelizeModule } from '@nestjs/sequelize'
import { UserEntity } from './users/entities/user.entity'
import { CategoryEntity } from './categories/entities/category.entity'
import { GroupEntity } from './groups/entities/group.entity'
import { postgresSettings } from './settings'
import { NodeEntity } from './nodes/entities/node.entity'
import { AnswerEntity } from './nodes/entities/answer.entity'
import { ResultEntity } from './results/entities/result.entity'

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...postgresSettings,
      models: [UserEntity, CategoryEntity, GroupEntity, NodeEntity, AnswerEntity, ResultEntity],
      autoLoadModels: true, // Automatically load models
      synchronize: true // Auto-sync models with DB
    }),
    GamesModule,
    CategoriesModule,
    GroupsModule,
    AuthModule,
    UsersModule,
    NodesModule,
    ResultsModule
  ],
  controllers: [AppController],
  providers: [AppService, Seeder]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*')
  }
}
