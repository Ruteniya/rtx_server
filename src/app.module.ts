import { MiddlewareConsumer, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { settings } from './settings'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GamesModule } from './games/games.module'
import { CategoriesModule } from './categories/categories.module'
import { GroupsModule } from './groups/groups.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import * as cookieParser from 'cookie-parser'

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: settings.database.dialect,
      host: settings.database.host,
      port: settings.database.port,
      username: settings.database.username,
      password: settings.database.password,
      database: settings.database.database,
      logging: settings.database.logging,
      autoLoadModels: true,
      modelMatch: (filename: string) => filename.includes('.entity'),
      synchronize: false,
      dialectOptions: settings.database.dialectOptions
    }),
    GamesModule,
    CategoriesModule,
    GroupsModule,
    AuthModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*')
  }
}
