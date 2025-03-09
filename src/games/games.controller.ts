import { Controller, Post, Body, Delete, Param, Get, Patch } from '@nestjs/common'
import { GamesService } from './games.service'
import { Dto } from 'src/dto'
import { SystemAuth } from 'src/decorators'

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @SystemAuth()
  @Post()
  async create(@Body() createGameDto: Dto.Games.CreateGameDto) {
    return await this.gamesService.create(createGameDto)
  }

  @SystemAuth()
  @Patch(':id')
  async update(@Body() updateGameDto: Dto.Games.UpdateGameDto, @Param('id') gameId: string) {
    return await this.gamesService.update(gameId, updateGameDto)
  }

  @Get()
  async findOne() {
    return await this.gamesService.findOne()
  }

  @SystemAuth()
  @Delete(':id')
  async remove(@Param('id') gameId: string) {
    return await this.gamesService.remove(gameId)
  }
}
