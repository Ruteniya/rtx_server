import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { GameEntity } from './entities/game.entity'
import { Pto } from 'rtxtypes'

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(GameEntity)
    private readonly gameRepo: typeof GameEntity
  ) {}

  private mapEntityToPto(game: GameEntity): Pto.Games.Game {
    return {
      id: game.id,
      name: game.name,
      description: game.description || '',
      logo: game.logo || '',
      startDate: game.startDate,
      endDate: game.endDate
    }
  }

  // Method to check whether the game is within the allowed time
  async checkGameTime(checkEndDate: boolean = true): Promise<void> {
    const game = await this.gameRepo.findOne()

    if (!game) {
      throw new NotFoundException(Pto.Errors.Messages.GAME_NOT_FOUND)
    }

    const currentTime = new Date()

    if (currentTime < new Date(game.startDate)) {
      throw new BadRequestException('Гра ще не розпочалась')
    }

    if (checkEndDate) {
      if (currentTime > new Date(game.endDate)) {
        throw new BadRequestException('Гра закінчилась')
      }
    }
  }

  async create(createGame: Pto.Games.CreateGame): Promise<Pto.Games.Game> {
    const existingGame = await this.gameRepo.findOne()

    if (existingGame) {
      throw new BadRequestException(Pto.Errors.Messages.GAME_ALREADY_EXISTS)
    }

    const game = await this.gameRepo.create(createGame)

    return this.mapEntityToPto(game)
  }

  async update(id: string, updateGame: Pto.Games.UpdateGame): Promise<Pto.Games.Game> {
    const game = await this.gameRepo.findByPk(id)

    if (!game) {
      throw new NotFoundException(Pto.Errors.Messages.GAME_NOT_FOUND)
    }

    await game.update(updateGame)

    return this.mapEntityToPto(game)
  }

  async findOne(): Promise<Pto.Games.Game> {
    const game = await this.gameRepo.findOne()

    if (!game) throw new NotFoundException(Pto.Errors.Messages.GAME_NOT_FOUND)

    return this.mapEntityToPto(game)
  }

  async remove(gameId: string): Promise<void> {
    const game = await this.gameRepo.findOne({
      where: { id: gameId }
    })

    if (!game) {
      throw new Error(Pto.Errors.Messages.GAME_NOT_FOUND)
    }

    await game.destroy()
  }
}
