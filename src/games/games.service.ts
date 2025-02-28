import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { GameEntity } from './entities/game.entity'
import { Pto } from '@rtx/types'

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

  async create(createGame: Pto.Games.CreateGame): Promise<Pto.Games.Game> {
    const existingGame = await this.gameRepo.findOne()

    if (existingGame) {
      throw new BadRequestException('A game already exists. Delete it and try again')
    }

    const game = await this.gameRepo.create(createGame)

    return this.mapEntityToPto(game)
  }

  async update(id: string, updateGame: Pto.Games.UpdateGame): Promise<Pto.Games.Game> {
    const game = await this.gameRepo.findByPk(id)

    if (!game) {
      throw new NotFoundException('Game not found')
    }

    await game.update(updateGame)

    return this.mapEntityToPto(game)
  }

  async findOne(): Promise<Pto.Games.Game> {
    const game = await this.gameRepo.findOne()

    if (!game) throw new NotFoundException('Game not found')

    return this.mapEntityToPto(game)
  }

  async remove(gameId: string): Promise<void> {
    const game = await this.gameRepo.findOne({
      where: { id: gameId }
    })

    if (!game) {
      throw new Error('Game not found')
    }

    await game.destroy()
  }
}
