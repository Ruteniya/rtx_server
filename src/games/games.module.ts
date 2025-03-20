import { Module } from '@nestjs/common'
import { GamesService } from './games.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { GameEntity } from './entities/game.entity'
import { GamesController } from './games.controller'

@Module({
  imports: [SequelizeModule.forFeature([GameEntity])],
  providers: [GamesService],
  controllers: [GamesController],
  exports: [GamesService]
})
export class GamesModule {}
