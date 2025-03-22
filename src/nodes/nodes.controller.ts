import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common'
import { NodesService } from './nodes.service'
import { Dto } from 'src/dto'
import { AdminAuth, Auth, SystemAuth } from 'src/decorators'
import { GamesService } from 'src/games/games.service'
import { Response } from 'express'

@Controller('nodes')
export class NodesController {
  constructor(
    private readonly nodesService: NodesService,
    private readonly gamesService: GamesService
  ) {}

  @SystemAuth()
  @Post()
  create(@Body() createNodeDto: Dto.Nodes.CreateNodeDto) {
    return this.nodesService.createNode(createNodeDto)
  }

  @Auth()
  @Get('small')
  async findAllSmallVersion(@Res() res: Response) {
    await this.gamesService.checkGameTime(false)

    const nodes = await this.nodesService.findAllNodesSmall()
    return res.json(nodes)
  }

  @Auth()
  @Get('short')
  async findAllShortVersion() {
    await this.gamesService.checkGameTime()

    return this.nodesService.findAllNodesShort()
  }

  @AdminAuth()
  @Get()
  findAll() {
    return this.nodesService.findAllNodes()
  }

  @Auth()
  @Get('short/:id')
  async findShortOne(@Param('id') id: string) {
    await this.gamesService.checkGameTime(false)

    return this.nodesService.findShortNode(id)
  }

  @AdminAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodesService.findNode(id)
  }

  @SystemAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNodeDto: Dto.Nodes.UpdateNodeDto) {
    return this.nodesService.updateNode(id, updateNodeDto)
  }

  @SystemAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodesService.removeNode(id)
  }
}
