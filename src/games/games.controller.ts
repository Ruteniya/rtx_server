import { Controller, Post, Body, Delete, Param, Get, Patch, UseInterceptors, UploadedFile } from '@nestjs/common'
import { GamesService } from './games.service'
import { Dto } from 'src/dto'
import { SystemAuth } from 'src/decorators'
import { FileInterceptor } from '@nestjs/platform-express'
import { Multer } from 'multer'

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @SystemAuth()
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(@UploadedFile() file: Multer.File, @Body() createGameDto: Dto.Games.CreateGameDto) {
    return await this.gamesService.create(createGameDto, file)
  }

  @SystemAuth()
  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @UploadedFile() file: Multer.File,
    @Body() updateGameDto: Dto.Games.UpdateGameDto,
    @Param('id') gameId: string
  ) {
    return await this.gamesService.update(gameId, updateGameDto, file)
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
