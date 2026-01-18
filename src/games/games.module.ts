import { Module } from '@nestjs/common'
import { GamesService } from './games.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { GameEntity } from './entities/game.entity'
import { GamesController } from './games.controller'
import { S3Module } from 'src/s3/s3.module'

@Module({
  imports: [SequelizeModule.forFeature([GameEntity]), S3Module],
  providers: [GamesService],
  controllers: [GamesController],
  exports: [GamesService]
})
export class GamesModule {}
