import { MiddlewareConsumer, Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
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
import { Seeder } from './seeder/seeder'
import { SequelizeModule } from '@nestjs/sequelize'
import { UserEntity } from './users/entities/user.entity'
import { CategoryEntity } from './categories/entities/category.entity'
import { GroupEntity } from './groups/entities/group.entity'
import { postgresSettings } from './settings'
import { NodeEntity } from './nodes/entities/node.entity'
import { AnswerEntity } from './nodes/entities/answer.entity'
import { ResultEntity } from './results/entities/result.entity'
import { NodeCategoryEntity } from './nodes/entities/node-category.entity'
// import { ServeStaticModule } from '@nestjs/serve-static'
import { S3Module } from './s3/s3.module'
import { WinstonModule } from 'nest-winston'
import { winstonConfig } from './utils/winston.config'
import { HttpLoggingInterceptor } from './interceptors/http-logging.interceptor'
import { EmailModule } from './email/email.module';
// import * as path from 'path'

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: path.join(__dirname, settings.frontendFiles),
    //   serveStaticOptions: { index: false }
    // }),
    SequelizeModule.forRoot({
      ...postgresSettings,
      models: [UserEntity, CategoryEntity, GroupEntity, NodeEntity, AnswerEntity, ResultEntity, NodeCategoryEntity],
      autoLoadModels: true, // Automatically load models
    }),
    GamesModule,
    CategoriesModule,
    GroupsModule,
    AuthModule,
    UsersModule,
    NodesModule,
    ResultsModule,
    S3Module,
    WinstonModule.forRoot(winstonConfig),
    EmailModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Seeder,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor
    }
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*')
  }
}
