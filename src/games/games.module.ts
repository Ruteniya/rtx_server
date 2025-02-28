import { Module } from '@nestjs/common'
import { GamesService } from './games.service'
import { GamesController } from './games.controller'
import { SequelizeModule } from '@nestjs/sequelize'
import { GameEntity } from './entities/game.entity'

@Module({
  imports: [SequelizeModule.forFeature([GameEntity])],
  providers: [GamesService],
  controllers: [GamesController]
})
export class GamesModule {}
