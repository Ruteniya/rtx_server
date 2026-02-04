import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { GameEntity } from './entities/game.entity'
import { Pto } from 'rtxtypes'
import { S3Service } from 'src/s3/s3.service'
import { Multer } from 'multer'
import { Attributes } from 'sequelize'

const GAMES_DIRECTORY = 'games'

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(GameEntity)
    private readonly gameRepo: typeof GameEntity,
    private readonly s3Service: S3Service
  ) {}

  private async mapEntityToPto(game: GameEntity): Promise<Pto.Games.Game> {
    return {
      id: game.id,
      name: game.name,
      description: game.description || '',
      logo: game.logo ? await this.s3Service.getSignedUrl(game.logo) : '',
      status: game.status,
      startDate: game.startDate,
      endDate: game.endDate
    }
  }

  // Method to check whether the game is within the allowed time
  async validateGame(checkEndDate: boolean = true): Promise<void> {
    const game = await this.gameRepo.findOne()

    if (!game) {
      throw new NotFoundException(Pto.Errors.Messages.GAME_NOT_FOUND)
    }

    await this.validateGameTime(game, checkEndDate)
    await this.validateGameStatus(game.status)
  }

  private async validateGameTime(game: GameEntity, checkEndDate: boolean = true): Promise<void> {
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

  private async validateGameStatus(status: Pto.Games.GameStatus): Promise<void> {
    if (status === Pto.Games.GameStatus.Draft) {
      throw new BadRequestException("Гра ще не готова до початку")
    }

    if (status === Pto.Games.GameStatus.Finished) {
      throw new BadRequestException("Гра вже закінчилась")
    }

    if (status === Pto.Games.GameStatus.Stopped) {
      throw new BadRequestException("Гра призупинена")
    }
  }

  async create(createGame: Pto.Games.CreateGame, logoFile?: Multer.File): Promise<Pto.Games.Game> {
    const existingGame = await this.gameRepo.findOne()
    if (existingGame) {
      throw new BadRequestException(Pto.Errors.Messages.GAME_ALREADY_EXISTS)
    }

    let logoKey: string | undefined

    if (logoFile) {
      logoKey = await this.s3Service.uploadFile(logoFile, GAMES_DIRECTORY)
    }

    const game = await this.gameRepo.create({
      ...createGame,
      logo: logoKey
    })

    return await this.mapEntityToPto(game)
  }

  async update(
    id: string,
    updateGame: Pto.Games.UpdateGame,
    logoFile: Multer.File | null | undefined,
    options: Pto.Games.UpdateGameOptions
  ): Promise<Pto.Games.Game> {
    const game = await this.gameRepo.findByPk(id)
    const data: Partial<Attributes<GameEntity>> = { ...updateGame }

    if (!game) {
      throw new NotFoundException(Pto.Errors.Messages.GAME_NOT_FOUND)
    }

    if (logoFile || options.deleteLogo === true) {
      if (game.logo) {
        try {
          await this.s3Service.deleteFile(game.logo)
          data.logo = ''
        } catch (e) {
          console.warn('Не вдалося видалити старий логотип з S3', e)
        }
      }
    }

    if (logoFile) {
      const newKey = await this.s3Service.uploadFile(logoFile, GAMES_DIRECTORY)

      data.logo = newKey
    }

    await game.update(data)

    return await this.mapEntityToPto(game)
  }

  async findOne(): Promise<Pto.Games.Game> {
    const game = await this.gameRepo.findOne()

    if (!game) throw new NotFoundException(Pto.Errors.Messages.GAME_NOT_FOUND)

    return await this.mapEntityToPto(game)
  }

  async remove(gameId: string): Promise<void> {
    const game = await this.gameRepo.findOne({
      where: { id: gameId }
    })

    if (!game) {
      throw new Error(Pto.Errors.Messages.GAME_NOT_FOUND)
    }

    if (game.logo) {
      try {
        await this.s3Service.deleteFile(game.logo)
      } catch (e) {
        console.warn('Не вдалося видалити старий логотип з S3', e)
      }
    }

    await game.destroy()
  }
}
