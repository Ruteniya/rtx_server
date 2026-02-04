import { Controller, Post, Body, Delete, Param, Get, UseInterceptors, UploadedFile, Put, Query, Logger } from '@nestjs/common'
import { GamesService } from './games.service'
import { Dto } from 'src/dto'
import { SystemAuth } from 'src/decorators'
import { FileInterceptor } from '@nestjs/platform-express'
import { Multer } from 'multer'

@Controller('games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name)

  constructor(private readonly gamesService: GamesService) {}

  @SystemAuth()
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(@UploadedFile() file: Multer.File, @Body() createGameDto: Dto.Games.CreateGameDto) {
    this.logger.log(`Creating game: ${createGameDto.name}`)
    const game = await this.gamesService.create(createGameDto, file)
    this.logger.log(`Game created successfully: ${game.id}`)
    return game
  }

  @SystemAuth()
  @Put(':id')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @UploadedFile() file: Multer.File,
    @Body() updateGameDto: Dto.Games.UpdateGameDto,
    @Param('id') gameId: string,
    @Query() query: Dto.Games.UpdateGameOptionsDto
  ) {
    this.logger.log(`Updating game: ${gameId}`)
    const game = await this.gamesService.update(gameId, updateGameDto, file, query)
    this.logger.log(`Game updated successfully: ${gameId}`)
    return game
  }

  @Get()
  async findOne() {
    this.logger.log('Getting current game')
    return await this.gamesService.findOne()
  }

  @SystemAuth()
  @Delete(':id')
  async remove(@Param('id') gameId: string) {
    this.logger.warn(`Deleting game: ${gameId}`)
    await this.gamesService.remove(gameId)
    this.logger.log(`Game deleted successfully: ${gameId}`)
  }
}
